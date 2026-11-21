import type { Event } from "@/types";
import { site } from "./site";

/** Start and end as real instants. Hawaiʻi has no daylight saving, so it is always UTC-10. */
function span(ev: Event): [Date, Date] {
  const at = (t: string) => {
    const [y, m, d] = ev.date.split("-").map(Number);
    const [h, min] = t.split(":").map(Number);
    return new Date(Date.UTC(y, m - 1, d, h + 10, min));
  };
  const start = at(ev.start_time);
  // Many organizers post a start time only; show those as an hour long.
  const end = ev.end_time > ev.start_time ? at(ev.end_time) : new Date(start.getTime() + 3_600_000);
  return [start, end];
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const where = (ev: Event) => (ev.online ? "Online" : [ev.location.venue, ev.address ?? ev.location.city].filter(Boolean).join(", "));
const eventUrl = (ev: Event) => `${site.url}/events/${ev.id}`;
const notes = (ev: Event) => `${ev.description.replace(/\s+/g, " ").slice(0, 400).trim()}\n\nDetails and sign-up: ${eventUrl(ev)}`;

export function googleCalendarUrl(ev: Event): string {
  const [s, e] = span(ev);
  const q = new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates: `${stamp(s)}/${stamp(e)}`, details: notes(ev), location: where(ev) });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** ICS lines may not run past 75 characters; longer ones continue on the next line after a space. */
const fold = (line: string) => {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(line.slice(i, i + 74));
  return parts.join("\r\n ");
};

/** The text of an .ics file that Apple Calendar, Outlook and Google Calendar can all import. */
export function icsFile(ev: Event): string {
  const [s, e] = span(ev);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PathCross//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${ev.id}@joinpathcross.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(s)}`,
    `DTEND:${stamp(e)}`,
    `SUMMARY:${esc(ev.title)}`,
    `LOCATION:${esc(where(ev))}`,
    `DESCRIPTION:${esc(notes(ev))}`,
    `URL:${eventUrl(ev)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold).join("\r\n") + "\r\n";
}
