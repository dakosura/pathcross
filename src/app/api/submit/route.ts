import { visitorCode } from "@/lib/analytics";
import { validateSubmission } from "@/lib/submissions";
import { adminClient } from "@/lib/supabase-admin";

// Receives a listing request from /submit and stores it for the site owner (see /ops).
export async function POST(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const text = await request.text();
    if (text.length > 20_000) return json({ error: "too-long" }, 413);
    const body = JSON.parse(text) as Record<string, unknown>;

    // Bots: a hidden field people never see, and forms sent faster than a person could fill them in.
    // They get a normal-looking success so they don't learn what tripped.
    const tooFast = typeof body.ts === "number" && Date.now() - body.ts < 4000;
    if (typeof body.hp === "string" && body.hp.trim()) return json({ ok: true });
    if (tooFast) return json({ ok: true });

    const result = validateSubmission(body);
    if (!result.ok) return json({ error: "invalid", errors: result.errors }, 422);

    const ua = request.headers.get("user-agent") ?? "";
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "";
    const ip_hash = visitorCode(ip, ua);

    const db = adminClient();
    const { count } = await db.from("listing_submissions").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", new Date(Date.now() - 3_600_000).toISOString());
    if ((count ?? 0) >= 5) return json({ error: "rate-limited" }, 429);

    const { error } = await db.from("listing_submissions").insert({ ...result.data, ip_hash });
    if (error) throw error;
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}
