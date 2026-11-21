"use client";
import { useRef } from "react";
import type { Event } from "@/types";
import { downloadIcs, googleCalendarUrl, icsFile } from "@/lib/calendar-links";

/** A small menu to put an event on Google Calendar, or download an .ics file for Apple Calendar and Outlook. */
export function AddToCalendar({ event, size = "sm" }: { event: Event; size?: "sm" | "lg" }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const sizing = size === "lg" ? "w-full justify-center px-4 py-3 text-sm" : "px-3 py-1.5 text-xs";

  function download() {
    downloadIcs(`${event.id}.ics`, icsFile(event));
    if (menu.current) menu.current.open = false;
  }

  return (
    <details ref={menu} className="relative z-10">
      <summary className={`inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full font-semibold text-forest ring-1 ring-forest/25 transition hover:bg-moss-50 [&::-webkit-details-marker]:hidden ${sizing}`}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        Add to calendar
      </summary>
      <div className="absolute left-0 z-20 mt-2 w-52 rounded-xl border border-line bg-card p-1.5 text-sm shadow-lg">
        <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" onClick={() => { if (menu.current) menu.current.open = false; }} className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-sand">
          Google Calendar <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
        </a>
        <button type="button" onClick={download} className="block w-full rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-sand">
          Apple / Outlook (.ics)
        </button>
      </div>
    </details>
  );
}
