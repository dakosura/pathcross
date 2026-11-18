import { adminClient } from "@/lib/supabase-admin";
import { browserOf, cleanPath, deviceOf, isBot, referrerHost, tag, visitorCode } from "@/lib/analytics";

// Receives one page view or outbound click from the browser. It always answers
// 204, so a failure here can never show up on the page.
export async function POST(request: Request) {
  try {
    const ua = request.headers.get("user-agent") ?? "";
    if (isBot(ua)) return new Response(null, { status: 204 });

    const text = await request.text();
    if (text.length > 2000) return new Response(null, { status: 204 });
    const body = JSON.parse(text) as Record<string, unknown>;

    const path = cleanPath(body.path);
    // The Ops page and APIs are not visits.
    if (!path || path.startsWith("/ops") || path.startsWith("/api")) return new Response(null, { status: 204 });
    const kind = body.kind === "outbound" ? "outbound" : "view";
    let target: string | null = null;
    if (kind === "outbound") {
      try { target = new URL(String(body.target)).hostname.replace(/^www\./, "").slice(0, 80); } catch { return new Response(null, { status: 204 }); }
    }

    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "";
    const country = request.headers.get("x-vercel-ip-country");

    await adminClient().from("page_views").insert({
      kind,
      path,
      referrer: kind === "view" ? referrerHost(body.referrer) : null,
      source: tag(body.source),
      medium: tag(body.medium),
      campaign: tag(body.campaign),
      country: country && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null,
      device: deviceOf(ua),
      browser: browserOf(ua),
      visitor: visitorCode(ip, ua),
      target,
    });
  } catch {
    /* counting is best-effort */
  }
  return new Response(null, { status: 204 });
}
