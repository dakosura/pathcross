import type { Event } from "@/types";
import type { IngestedEvent } from "./types";

interface Prop { params: Record<string, string>; value: string }

function unfold(text: string) {
  return text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function unescapeText(v: string) {
  return v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

function parseLine(line: string): [string, Prop] | null {
  const idx = line.indexOf(":");
  if (idx < 0) return null;
  const [name, ...paramParts] = line.slice(0, idx).split(";");
  const params: Record<string, string> = {};
  for (const p of paramParts) {
    const [k, v] = p.split("=");
    if (k && v) params[k.toUpperCase()] = v;
  }
  return [name.toUpperCase(), { params, value: line.slice(idx + 1) }];
}

/** Returns local Honolulu date + time. UTC ("Z") values are converted from UTC. */
function toHonolulu(p: Prop): { date: string; time: string } | null {
  const m = p.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00", , z] = m;
  if (!z) return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}` };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Honolulu", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi)));
  const g = (t: string) => parts.find((x) => x.type === t)!.value;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour")}:${g("minute")}` };
}

export interface IcsOptions {
  /** Short stable id for this feed, used as the id prefix, e.g. "meetup-honolulu-tech-network" */
  key: string;
  organizer: string;
  category: Event["category"];
  city?: string;
}

/**
 * Minimal ICS reader. Limitations: ignores RRULE expansion (feeds like Meetup's
 * already list each occurrence as its own VEVENT) and assumes feed times are
 * Pacific/Honolulu unless suffixed with Z.
 */
export function parseIcs(text: string, opts: IcsOptions): IngestedEvent[] {
  const out: IngestedEvent[] = [];
  let cur: Record<string, Prop> | null = null;
  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") {
      if (cur) { const ev = toEvent(cur, opts); if (ev) out.push(ev); }
      cur = null; continue;
    }
    if (!cur) continue;
    const parsed = parseLine(line);
    if (parsed && !(parsed[0] in cur)) cur[parsed[0]] = parsed[1];
  }
  return out;
}

function toEvent(p: Record<string, Prop>, o: IcsOptions): IngestedEvent | null {
  if (!p.UID || !p.SUMMARY || !p.DTSTART) return null;
  if (p.STATUS?.value.toUpperCase() === "CANCELLED") return null;
  const start = toHonolulu(p.DTSTART);
  if (!start) return null;
  const end = p.DTEND ? toHonolulu(p.DTEND) : null;
  const url = p.URL?.value ?? "";
  if (!url) return null;
  const location = p.LOCATION ? unescapeText(p.LOCATION.value) : "";
  const [venue, ...rest] = location.split(",").map((s) => s.trim()).filter(Boolean);
  const uid = p.UID.value;
  return {
    id: `${o.key}-${uid.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`.slice(0, 120),
    external_id: uid,
    title: unescapeText(p.SUMMARY.value).trim(),
    description: unescapeText(p.DESCRIPTION?.value ?? "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\\([-!.*_()[\]#+])/g, "$1").trim().slice(0, 1500),
    date: start.date,
    start_time: start.time,
    end_time: end && end.date === start.date ? end.time : start.time,
    location: { venue: venue || "See event listing", city: o.city ?? "Honolulu" },
    address: rest.length ? rest.join(", ") : undefined,
    organizer: o.organizer,
    source_url: url,
    city: o.city ?? "Honolulu",
    category: o.category,
  };
}
