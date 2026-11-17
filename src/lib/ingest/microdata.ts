import type { Event } from "@/types";
import type { IngestedEvent } from "./types";

/**
 * Reads event calendars that publish schema.org Event microdata on each event
 * page. That covers GrowthZone / ChamberMaster sites (used by many chambers
 * and trade associations), e.g. https://business.cochawaii.org/events.
 *
 * How it works: load the month calendar for this month and the next few,
 * collect the links to event pages, then read each page's own markup
 * (name, startDate, endDate, location, fees). Nothing is guessed: an event
 * page without a name and start date is skipped.
 */
export interface MicrodataOptions {
  key: string;
  /** Calendar page, e.g. "https://business.cochawaii.org/events/calendar" */
  calendarUrl: string;
  organizer: string;
  category: Event["category"];
  /** How many months ahead to read, counting the current one. Default 3. */
  months?: number;
}

const UA = "PathCrossBot/1.0 (event aggregator)";
const MAX_EVENTS = 60;

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };

export function decodeEntities(s: string) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

/** HTML fragment to plain text, keeping paragraph breaks. */
export function htmlToText(html: string) {
  const t = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h\d)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(t)
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function honolulu(iso: string): { date: string; time: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Honolulu", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => parts.find((x) => x.type === t)!.value;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour")}:${g("minute")}` };
}

const attr = (html: string, prop: string) =>
  html.match(new RegExp(`itemprop="${prop}"\\s+content="([^"]*)"`, "i"))?.[1];

/** Inner text of the first element carrying itemprop=prop (single-level spans). */
const spanText = (html: string, prop: string) => {
  const m = html.match(new RegExp(`itemprop="${prop}"[^>]*>([\\s\\S]*?)</span>`, "i"));
  return m ? htmlToText(m[1]) : "";
};

/** Slice between a start marker and the first of several end markers. */
function between(html: string, start: string, ends: string[]) {
  const a = html.indexOf(start);
  if (a < 0) return "";
  const from = html.indexOf(">", a) + 1;
  let to = html.length;
  for (const e of ends) {
    const i = html.indexOf(e, from);
    if (i >= 0 && i < to) to = i;
  }
  return html.slice(from, to);
}

/** Parses one event page. Exported for tests. */
export function parseEventPage(html: string, url: string, o: MicrodataOptions): IngestedEvent | null {
  const scopeAt = html.search(/itemtype="https?:\/\/schema\.org\/Event"/i);
  if (scopeAt < 0) return null;
  const page = html.slice(scopeAt);

  const title = decodeEntities(attr(page, "name") ?? "").trim();
  const startIso = attr(page, "startDate");
  if (!title || !startIso) return null;
  if (/cancel/i.test(attr(page, "eventStatus") ?? "")) return null;
  const start = honolulu(startIso);
  if (!start) return null;
  const endIso = attr(page, "endDate");
  const end = endIso ? honolulu(endIso) : null;

  const loc = between(page, 'itemprop="location"', ["gz-event-fees", "gz-event-contactInfo"]);
  // The venue name block often carries parking notes after the first line.
  const venue = htmlToText(loc.match(/itemprop="name"[^>]*>([\s\S]*?)(?:<\/p>|itemprop="address")/i)?.[1] ?? "").split("\n")[0] ?? "";
  const street = spanText(loc, "streetAddress");
  const city = spanText(loc, "addressLocality");
  const region = spanText(loc, "addressRegion");
  const zip = spanText(loc, "postalCode");
  const address = street ? [street, city, [region, zip].filter(Boolean).join(" ")].filter(Boolean).join(", ") : undefined;

  const description = htmlToText(between(page, 'itemprop="about"', ["<!-- row for video", "<!-- right column", "gz-eventdetails-card"])).slice(0, 1500);
  const fees = htmlToText(between(page, 'class="gz-event-fees"', ["gz-event-contactInfo", "<!--event reminder"]))
    .split("\n").join(" · ").split(/ · (?=refund|cancellation)/i)[0].slice(0, 220);

  const externalId = url.match(/-(\d+)(?:[/?#].*)?$/)?.[1] ?? url;
  return {
    id: `${o.key}-${externalId}`.slice(0, 120),
    external_id: externalId,
    title,
    description,
    date: start.date,
    start_time: start.time,
    end_time: end && end.date === start.date ? end.time : start.time,
    location: { venue: venue || "See event listing", city: city || "Honolulu" },
    address,
    organizer: o.organizer,
    source_url: url,
    price: fees || undefined,
    city: city || "Honolulu",
    category: o.category,
  };
}

async function get(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export async function fetchMicrodataCalendar(o: MicrodataOptions): Promise<IngestedEvent[]> {
  const base = new URL(o.calendarUrl);
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Pacific/Honolulu" }));
  const links = new Set<string>();

  for (let i = 0; i < (o.months ?? 3); i++) {
    const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const stamp = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-01`;
    // The first month must load; later months are a bonus.
    const html = await get(`${o.calendarUrl.replace(/\/$/, "")}/${stamp}`).catch((err) => { if (i === 0) throw err; return ""; });
    for (const hit of html.matchAll(/href="([^"]*\/events\/details\/[a-z0-9-]+-\d+)(?:\?[^"]*)?"/gi)) {
      links.add(new URL(hit[1], base).toString());
    }
  }

  const urls = [...links].slice(0, MAX_EVENTS);
  const out: IngestedEvent[] = [];
  // A few pages at a time, to stay polite to the host.
  for (let i = 0; i < urls.length; i += 4) {
    const batch = await Promise.all(urls.slice(i, i + 4).map(async (u) => {
      try { return parseEventPage(await get(u), u, o); } catch { return null; }
    }));
    for (const ev of batch) if (ev) out.push(ev);
  }
  return out;
}
