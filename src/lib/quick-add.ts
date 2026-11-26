import "server-only";
import { categoryStyle } from "./categories";
import { events as realEvents } from "./data";
import { adminClient } from "./supabase-admin";
import type { EventCategory } from "@/types";

export const CATEGORIES = Object.keys(categoryStyle) as EventCategory[];

/** What the quick-add form edits and the server stores. */
export interface DraftEvent {
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM, 24h
  end_time: string;
  venue: string;
  address: string;
  organizer: string;
  description: string;
  price: string;
  category: EventCategory;
  source_url: string;
  registration_url: string;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const time = (v: unknown) => { const m = str(v, 8).match(/^(\d{1,2}):(\d{2})/); return m && +m[1] < 24 && +m[2] < 60 ? `${m[1].padStart(2, "0")}:${m[2]}` : ""; };
const url = (v: unknown) => { const s = str(v, 500); try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? u.toString() : ""; } catch { return ""; } };

/** Cleans whatever came back from the model or the form into a DraftEvent (unknown fields become empty). */
export function cleanDraft(raw: unknown): DraftEvent {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const date = str(b.date, 10);
  const start = time(b.start_time);
  return {
    title: str(b.title, 200),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    start_time: start,
    end_time: time(b.end_time) || start,
    venue: str(b.venue, 200),
    address: str(b.address, 300),
    organizer: str(b.organizer, 200),
    description: str(b.description, 1500),
    price: str(b.price, 200),
    category: CATEGORIES.includes(b.category as EventCategory) ? (b.category as EventCategory) : "General Professional",
    source_url: url(b.source_url),
    registration_url: url(b.registration_url),
  };
}

export function validateDraft(d: DraftEvent): string | null {
  if (!d.title) return "Add a title.";
  if (!d.date) return "Add a date.";
  if (!d.start_time) return "Add a start time.";
  if (!d.source_url) return "Add a link to the event (starting with https://).";
  return null;
}

const hst = () => new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Honolulu" });

/** Rejects addresses that point back inside our own network. */
function safePublicUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return null;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^(\d+\.){3}\d+$/.test(h) || h.includes(":")) return null;
    return u;
  } catch {
    return null;
  }
}

/** Fetches a web page and reduces it to readable text plus its social-preview tags. */
export async function pageText(raw: string): Promise<string> {
  const u = safePublicUrl(raw);
  if (!u) throw new Error("That link doesn't look like a public web page.");
  const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (compatible; PathCrossBot/1.0)" }, signal: AbortSignal.timeout(10_000), redirect: "follow" });
  if (!res.ok) throw new Error(`The page answered ${res.status}. Paste its text or a screenshot instead.`);
  const html = (await res.text()).slice(0, 600_000);
  const meta = [...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:[a-z:]+|description|twitter:[a-z]+)["'][^>]*>/gi)].map((m) => m[0]).join("\n");
  const ld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join("\n");
  const body = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  return `${meta}\n${ld}\n${body}`.slice(0, 14_000);
}

const TOOL = {
  name: "record_event",
  description: "Record the event described in the material. Use an empty string for anything not stated; never guess.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      date: { type: "string", description: "YYYY-MM-DD" },
      start_time: { type: "string", description: "24h HH:MM, Hawaii time" },
      end_time: { type: "string", description: "24h HH:MM, empty if not stated" },
      venue: { type: "string", description: "Place name only" },
      address: { type: "string", description: "Street address if given" },
      organizer: { type: "string" },
      description: { type: "string", description: "1-3 plain sentences about what the event is" },
      price: { type: "string", description: "e.g. Free, $15, or empty" },
      category: { type: "string", enum: CATEGORIES },
      source_url: { type: "string", description: "The event's own page, if a link was provided or visible" },
      registration_url: { type: "string" },
    },
    required: ["title", "date", "start_time"],
  },
};

export type ImageInput = { media_type: string; data: string };

/** Asks Claude to read pasted text, a page, and/or a screenshot and fill in the event fields. */
export async function extractEvent(input: { text?: string; link?: string; image?: ImageInput }): Promise<DraftEvent> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set in Vercel yet.");

  const parts: string[] = [];
  if (input.link) parts.push(`Event link: ${input.link}`);
  if (input.link) {
    try { parts.push(`Text found on that page:\n${await pageText(input.link)}`); }
    catch (e) { if (!input.text && !input.image) throw e; }
  }
  if (input.text) parts.push(`Text pasted by the owner:\n${input.text.slice(0, 8000)}`);

  const content: unknown[] = [];
  if (input.image) content.push({ type: "image", source: { type: "base64", media_type: input.image.media_type, data: input.image.data } });
  content.push({ type: "text", text: `Today is ${hst()} in Honolulu. Extract the one event described below (a flyer, caption or page for a Honolulu-area professional/networking event). Resolve relative dates like "this Friday" from today, and if no year is shown pick the next upcoming date. Times are Hawaii time. Never invent details.\n\n${parts.join("\n\n") || "(see the attached image)"}` });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 1500, tools: [TOOL], tool_choice: { type: "tool", name: "record_event" }, messages: [{ role: "user", content }] }),
    signal: AbortSignal.timeout(40_000),
  });
  if (!res.ok) throw new Error(`The AI service answered ${res.status}.`);
  const out = (await res.json()) as { content?: { type: string; input?: unknown }[] };
  const draft = cleanDraft(out.content?.find((c) => c.type === "tool_use")?.input);
  if (input.link && !draft.source_url) draft.source_url = url(input.link);
  return draft;
}

export const eventId = (d: DraftEvent) => `manual-${d.date}-${d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}`;

export interface ExistingEvent { id: string; title: string; date: string }

/** The same link written the ways it may have been stored: no tracking query or #fragment, with and without a trailing slash. */
function linkVariants(raw: string): string[] {
  try {
    const u = new URL(raw);
    const base = `${u.origin}${u.pathname}`.replace(/\/+$/, "");
    return [...new Set([raw, base, `${base}/`])];
  } catch {
    return [];
  }
}

const sameLink = (a: string, b: string) => linkVariants(a).some((v) => linkVariants(b).includes(v));

/**
 * Looks for an event that is already listed: the same link (as its page or sign-up link), or, once a
 * draft exists, the same title on the same date. Returns it so the caller can skip adding a copy.
 */
export async function findExisting(links: string[], title?: string, date?: string): Promise<ExistingEvent | null> {
  const wanted = links.filter(Boolean);
  const curated = realEvents.find((e) => (title && date && e.date === date && e.title.toLowerCase() === title.toLowerCase()) || wanted.some((l) => sameLink(l, e.source_url) || (e.registration_url && sameLink(l, e.registration_url))));
  if (curated) return { id: curated.id, title: curated.title, date: curated.date };

  const db = adminClient();
  const variants = wanted.flatMap(linkVariants);
  if (variants.length) {
    const list = variants.map((v) => `"${v.replace(/"/g, "")}"`).join(",");
    const { data, error } = await db.from("events").select("id,title,date").eq("status", "active").or(`source_url.in.(${list}),registration_url.in.(${list})`).limit(1);
    if (error) throw error;
    if (data?.[0]) return data[0] as ExistingEvent;
  }
  if (title && date) {
    const { data, error } = await db.from("events").select("id,title,date").eq("status", "active").eq("date", date).ilike("title", title.replace(/[\\%_]/g, "\\$&")).limit(1);
    if (error) throw error;
    if (data?.[0]) return data[0] as ExistingEvent;
  }
  return null;
}
