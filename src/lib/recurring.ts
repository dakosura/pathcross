import type { Event } from "@/types";

/**
 * Things that happen on a schedule rather than once: farmers markets, run
 * clubs, volunteer shifts. Each is written down once as a Series (see
 * weekly-events.ts) and turned into dated events here, so the site never needs
 * a new entry every week.
 */
export interface Series {
  id: string;
  title: string;
  category: Event["category"];
  description: string;
  organizer: string;
  source_url: string;
  registration_url?: string;
  price?: string;
  note?: string;
  venue: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  club_id?: string;
  /** 24h, e.g. "07:30" */
  start: string;
  /** Leave out when the organizer doesn't post an end time. */
  end?: string;
  /** Weekdays, 0 = Sunday. */
  days?: number[];
  /** Which weeks of the month, 1 = first. Leave out for every week. */
  weeks?: number[];
  /** Exact dates, instead of a weekly rule. */
  dates?: string[];
  /** First and last day it runs (ISO), for seasonal series. */
  from?: string;
  until?: string;
  /** Overrides the generated label, e.g. "Select Saturdays". */
  label?: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORD = ["1st", "2nd", "3rd", "4th", "5th"];
const DAY_MS = 86_400_000;

// Dates are ISO strings and all arithmetic is done in UTC, so the result never
// depends on the server's time zone.
const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const addDays = (iso: string, n: number) => new Date(parse(iso).getTime() + n * DAY_MS).toISOString().slice(0, 10);
export const weekdayOf = (iso: string) => parse(iso).getUTCDay();

const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** "Every Saturday", "1st and 3rd Saturday of the month", "Select dates" */
export function describe(s: Series): string {
  if (s.label) return s.label;
  if (s.dates) return "Select dates";
  const days = (s.days ?? []).map((d) => DAYS[d]);
  if (s.weeks) return `${list(s.weeks.map((w) => ORD[w - 1]))} ${list(days)} of the month`;
  return `Every ${list(days)}`;
}

export function occursOn(s: Series, iso: string): boolean {
  if ((s.from && iso < s.from) || (s.until && iso > s.until)) return false;
  if (s.dates) return s.dates.includes(iso);
  if (!s.days?.includes(weekdayOf(iso))) return false;
  return !s.weeks || s.weeks.includes(Math.ceil(Number(iso.slice(8, 10)) / 7));
}

/** Dates this series happens on, from `fromIso` (inclusive) for the next `horizonDays` days. */
export function datesBetween(s: Series, fromIso: string, horizonDays: number): string[] {
  if (s.dates) return s.dates.filter((d) => d >= fromIso && d <= addDays(fromIso, horizonDays) && occursOn(s, d));
  const out: string[] = [];
  for (let i = 0; i <= horizonDays; i++) {
    const d = addDays(fromIso, i);
    if (occursOn(s, d)) out.push(d);
  }
  return out;
}

/**
 * One occurrence as a normal event. With `unique`, the id carries the date
 * ("series--2026-11-21") so a calendar can list every week; without it the id is
 * the series id, which always shows the next occurrence and never goes stale.
 */
export function occurrence(s: Series, date: string, unique = false): Event {
  return {
    id: unique ? `${s.id}--${date}` : s.id,
    series_id: s.id,
    recurrence: describe(s),
    title: s.title,
    description: s.description,
    date,
    start_time: s.start,
    end_time: s.end ?? s.start,
    location: { venue: s.venue, city: s.city ?? "Honolulu" },
    city: s.city ?? "Honolulu",
    address: s.address,
    organizer: s.organizer,
    source_url: s.source_url,
    registration_url: s.registration_url,
    price: s.price,
    note: s.note,
    category: s.category,
    club_id: s.club_id,
    featured: false,
    lat: s.lat,
    lng: s.lng,
  };
}

/** Splits "series--2026-11-21" into its parts, or null for an ordinary id. */
export function splitOccurrenceId(id: string): { series: string; date: string } | null {
  const m = id.match(/^(.+)--(\d{4}-\d{2}-\d{2})$/);
  return m ? { series: m[1], date: m[2] } : null;
}
