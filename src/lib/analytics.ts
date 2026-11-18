import "server-only";
import { createHmac } from "node:crypto";
import { site } from "./site";

/**
 * Helpers for the first-party visit counter (see /api/track and supabase/analytics.sql).
 * Nothing identifying is stored: the visitor code is a one-way hash that changes
 * every day, and the raw IP address and user agent are used only to compute it.
 */

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor|uptime|pingdom|vercel|curl|wget|python|go-http|node-fetch|axios|java\/|okhttp|httpclient|scrapy|phantom/i;

export const isBot = (ua: string) => !ua || BOT.test(ua);

export const deviceOf = (ua: string): "desktop" | "mobile" | "tablet" =>
  /ipad|tablet|kindle|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua)) ? "tablet" : /mobi|iphone|ipod|android/i.test(ua) ? "mobile" : "desktop";

export function browserOf(ua: string): string {
  if (/edg(e|a|ios)?\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios|chromium/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

const hstDay = () => new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Honolulu" });

/** Anonymous per-day visitor code. The key changes daily, so codes can't be linked across days. */
export function visitorCode(ip: string, ua: string): string {
  const secret = process.env.ANALYTICS_SALT || process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "pathcross";
  const dayKey = createHmac("sha256", secret).update(hstDay()).digest();
  return createHmac("sha256", dayKey).update(`${ip}|${ua}`).digest("hex").slice(0, 32);
}

const ALIASES: Record<string, string> = {
  "l.instagram.com": "instagram.com", "lm.facebook.com": "facebook.com", "l.facebook.com": "facebook.com", "m.facebook.com": "facebook.com",
  "t.co": "x.com", "twitter.com": "x.com", "lnkd.in": "linkedin.com", "out.reddit.com": "reddit.com", "old.reddit.com": "reddit.com",
  "com.google.android.gm": "gmail", "mail.google.com": "gmail", "android-app": "android app",
};

/** Site the visitor came from, as a bare host. Null for direct visits and for our own pages. */
export function referrerHost(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === new URL(site.url).hostname.replace(/^www\./, "")) return null;
    return (ALIASES[host] ?? host).slice(0, 80);
  } catch {
    return null;
  }
}

/** A path with no query string or hash, always starting with "/". Null if unusable. */
export function cleanPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const p = raw.split(/[?#]/)[0].trim();
  return p.startsWith("/") && p.length <= 300 && !/\s/.test(p) ? p : null;
}

/** Short lowercase label for a utm_* value. */
export const tag = (raw: unknown): string | null => (typeof raw === "string" && /^[\w .+-]{1,60}$/.test(raw.trim()) ? raw.trim().toLowerCase() : null);
