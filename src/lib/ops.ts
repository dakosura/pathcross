import "server-only";
import { getClubById } from "./clubs-all";
import { getEvent } from "./data";
import { goalLabel, professionLabel } from "./profile";
import { adminClient } from "./supabase-admin";

/** Who may open /ops: the emails in OPS_ADMIN_EMAILS (comma-separated). */
export const adminEmails = () => (process.env.OPS_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

interface Row { name?: string; visitors?: number }

export interface OpsStats {
  days: number;
  generatedAt: string;
  traffic: Record<string, unknown> | null;
  /** Set when the analytics table or function is missing */
  trafficError?: string;
  /** Listing requests from /submit, for the site owner only. */
  submissions: { total: number; error?: string; recent: Record<string, string | null>[] };
  accounts: {
    total: number;
    last7: number;
    last30: number;
    daily: { day: string; count: number }[];
    professions: Row[];
    goals: Row[];
    /** Newest sign-ups, for the site owner only. */
    recent: { email: string; created_at: string }[];
  };
}

/** A readable name for a page path, e.g. /events/kcc-farmers-market -> "KCC Farmers Market". */
async function pageLabel(path: string): Promise<string> {
  const ev = path.match(/^\/events\/([^/]+)$/);
  if (ev) return (await getEvent(ev[1]).catch(() => undefined))?.title ?? path;
  const club = path.match(/^\/clubs\/[^/]+\/([^/]+)$/);
  if (club) return (await getClubById(club[1]))?.name ?? path;
  return path === "/" ? "Home" : path;
}

const hst = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Pacific/Honolulu" });

function count(list: (string | undefined)[]): Row[] {
  const m = new Map<string, number>();
  for (const x of list) if (x) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].map(([name, visitors]) => ({ name, visitors })).sort((a, b) => (b.visitors ?? 0) - (a.visitors ?? 0));
}

export async function buildOpsStats(days: number): Promise<OpsStats> {
  const db = adminClient();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  // Traffic comes from one database function (supabase/analytics.sql).
  let traffic: Record<string, unknown> | null = null;
  let trafficError: string | undefined;
  const { data, error } = await db.rpc("ops_summary", { p_since: since, p_tz: "Pacific/Honolulu" });
  if (error || !data) trafficError = error?.message ?? "No data returned";
  else {
    traffic = data as Record<string, unknown>;
    const pages = (traffic.pages as { path: string }[]) ?? [];
    await Promise.all(pages.map(async (p) => Object.assign(p, { label: await pageLabel(p.path) })));
    const saved = (traffic.saved_top as { kind: string; id: string }[]) ?? [];
    for (const s of saved) {
      Object.assign(s, { label: s.kind === "clubs" ? (await getClubById(s.id))?.name ?? s.id : (await getEvent(s.id).catch(() => undefined))?.title ?? s.id });
    }
  }

  // Listing requests (supabase/migrations/..._listing_submissions.sql). Missing table is reported, not fatal.
  const subs = await db.from("listing_submissions").select("id,created_at,status,kind,name,organizer,interest,description,event_date,start_time,end_time,repeats,venue,address,price,website,social,join_info,extra,contact_name,contact_email,contact_phone", { count: "exact" }).order("created_at", { ascending: false }).limit(25);

  // Accounts: counted from the sign-in system. Emails are shown only to the admin, on /ops.
  const users: { email: string; created_at: string; user_metadata: Record<string, unknown> | null }[] = [];
  for (let page = 1; page <= 5; page++) {
    const { data: list, error: listError } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (listError || !list) break;
    users.push(...list.users.map((u) => ({ email: u.email ?? "", created_at: u.created_at, user_metadata: (u.user_metadata ?? null) as Record<string, unknown> | null })));
    if (list.users.length < 1000) break;
  }
  const now = Date.now();
  const ageDays = (u: { created_at: string }) => (now - new Date(u.created_at).getTime()) / 86_400_000;
  const perDay = new Map<string, number>();
  for (const u of users) if (ageDays(u) <= days) perDay.set(hst(new Date(u.created_at)), (perDay.get(hst(new Date(u.created_at))) ?? 0) + 1);
  const goalIds = users.flatMap((u) => (Array.isArray(u.user_metadata?.goals) ? (u.user_metadata!.goals as string[]) : []));

  return {
    days,
    generatedAt: new Date().toISOString(),
    traffic,
    trafficError,
    submissions: { total: subs.count ?? 0, error: subs.error?.message, recent: (subs.data ?? []) as Record<string, string | null>[] },
    accounts: {
      total: users.length,
      last7: users.filter((u) => ageDays(u) <= 7).length,
      last30: users.filter((u) => ageDays(u) <= 30).length,
      daily: [...perDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, c]) => ({ day, count: c })),
      professions: count(users.map((u) => (typeof u.user_metadata?.profession === "string" ? professionLabel(u.user_metadata.profession) : undefined))),
      goals: count(goalIds.map((g) => goalLabel(g))),
      recent: users
        .filter((u) => u.email)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 200)
        .map((u) => ({ email: u.email, created_at: u.created_at })),
    },
  };
}

/** Checks the Supabase access token on a request and that its email is an admin. Returns the email, or a ready-made error response. */
export async function requireAdmin(request: Request): Promise<{ email: string } | { error: Response }> {
  const fail = (body: unknown, status: number) => ({ error: Response.json(body, { status, headers: { "Cache-Control": "no-store" } }) });
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return fail({ error: "signed-out" }, 401);
  const { data, error } = await adminClient().auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !data.user?.email_confirmed_at) return fail({ error: "signed-out" }, 401);
  if (!adminEmails().includes(email)) return fail({ error: "not-admin" }, 403);
  return { email };
}
