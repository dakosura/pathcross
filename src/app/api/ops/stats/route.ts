import { adminEmails, buildOpsStats } from "@/lib/ops";
import { adminClient } from "@/lib/supabase-admin";

// Visitor analytics for the owner. The caller sends their Supabase access token;
// it is checked here, and only emails listed in OPS_ADMIN_EMAILS get an answer.
export async function GET(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "signed-out" }, 401);

    const { data, error } = await adminClient().auth.getUser(token);
    const email = data.user?.email?.toLowerCase();
    if (error || !email || !data.user?.email_confirmed_at) return json({ error: "signed-out" }, 401);

    const allowed = adminEmails();
    if (allowed.length === 0) return json({ error: "not-configured", email }, 403);
    if (!allowed.includes(email)) return json({ error: "not-admin", email }, 403);

    const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get("days")) || 30, 1), 365);
    return json(await buildOpsStats(days));
  } catch (err) {
    return json({ error: "server", message: err instanceof Error ? err.message : String(err) }, 500);
  }
}
