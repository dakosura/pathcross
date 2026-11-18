"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Event } from "@/types";
import { categoryStyle } from "@/lib/categories";
import { formatDate, formatRange, formatTime } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { EventRating } from "./EventRating";
import { SaveButton } from "./SaveButton";
import { SignupLink } from "./SignupLink";

const HOUR_PX = 56;
const MIN_BLOCK_MIN = 40;

const minutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** When an event posts no end time, show it as an hour long. */
const endOf = (e: Event) => (e.end_time > e.start_time ? minutes(e.end_time) : minutes(e.start_time) + 60);

/** Places overlapping events side by side. Returns each event with its column and the column count of its cluster. */
function layout(events: Event[]) {
  const sorted = [...events].sort((a, b) => minutes(a.start_time) - minutes(b.start_time) || endOf(b) - endOf(a));
  const placed: { e: Event; col: number; cols: number }[] = [];
  let cluster: { e: Event; col: number; cols: number }[] = [];
  let colEnds: number[] = [];
  let clusterEnd = -1;
  const flush = () => { cluster.forEach((c) => (c.cols = colEnds.length)); placed.push(...cluster); cluster = []; colEnds = []; };
  for (const e of sorted) {
    const s = minutes(e.start_time);
    if (cluster.length && s >= clusterEnd) flush();
    let col = colEnds.findIndex((end) => end <= s);
    if (col < 0) { col = colEnds.length; colEnds.push(0); }
    colEnds[col] = Math.max(s + MIN_BLOCK_MIN, endOf(e));
    clusterEnd = Math.max(clusterEnd, colEnds[col]);
    cluster.push({ e, col, cols: 1 });
  }
  flush();
  return placed;
}

/** Current Honolulu time as minutes since midnight. */
const nowMinutes = () => {
  const t = new Date().toLocaleTimeString("en-GB", { timeZone: "Pacific/Honolulu", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return minutes(t);
};

/**
 * A full-screen view of one day: an hour-by-hour timeline of everything on the
 * calendar, with the details and sign-up links for each event beside it.
 */
export function DayView({ date, events, today, onClose, onMove }: { date: string; events: Event[]; today: string; onClose: () => void; onMove: (delta: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [now] = useState(nowMinutes);

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onMove(-1);
      else if (e.key === "ArrowRight") onMove(1);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = previous; };
  }, [onClose, onMove]);

  const starts = events.map((e) => minutes(e.start_time));
  const ends = events.map(endOf);
  const firstHour = Math.max(0, Math.min(7, Math.floor((starts.length ? Math.min(...starts) : 420) / 60)));
  const lastHour = Math.min(24, Math.max(20, Math.ceil((ends.length ? Math.max(...ends) : 0) / 60) + 1));
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);
  const placed = layout(events);
  const isToday = date === today;
  const sorted = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const label = (h: number) => formatTime(`${String(h).padStart(2, "0")}:00`).replace(":00", "");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-2 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="day-title" className="rise flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => onMove(-1)} aria-label="Previous day" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-forest hover:bg-sand">‹</button>
            <button type="button" onClick={() => onMove(1)} aria-label="Next day" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-forest hover:bg-sand">›</button>
            <div className="ml-1 min-w-0">
              <h2 id="day-title" className="font-display text-lg font-semibold leading-tight text-ink sm:text-3xl">{formatDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2>
              <p className="text-sm text-bark" aria-live="polite">{events.length === 0 ? "Nothing listed" : `${events.length} ${events.length === 1 ? "event" : "events"}`}{isToday ? " · Today" : ""}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close day view" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl text-bark hover:bg-sand">×</button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_400px] lg:overflow-hidden">
          {/* Overlapping events get too narrow on a phone, so the timeline is for larger screens and the list below covers phones. */}
          <section aria-label="Timeline" className="hidden px-3 py-4 sm:px-6 md:block lg:overflow-y-auto">
            <div className="relative" style={{ height: hours.length * HOUR_PX }}>
              {hours.map((h, i) => (
                <div key={h} className="absolute inset-x-0 flex border-t border-line/80" style={{ top: i * HOUR_PX, height: HOUR_PX }}>
                  <span className="-mt-2.5 w-12 shrink-0 bg-card pr-2 text-right text-[11px] font-medium text-bark/70">{label(h)}</span>
                </div>
              ))}
              <div className="absolute inset-y-0 left-14 right-0">
                {placed.map(({ e, col, cols }) => {
                  const s = minutes(e.start_time);
                  const top = ((s - firstHour * 60) / 60) * HOUR_PX;
                  const height = Math.max(((endOf(e) - s) / 60) * HOUR_PX, (MIN_BLOCK_MIN / 60) * HOUR_PX) - 2;
                  const style = categoryStyle[e.category];
                  return (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      title={e.title}
                      className={`absolute overflow-hidden rounded-lg px-2 py-1 text-left text-xs leading-snug transition hover:brightness-95 hover:shadow-md ${style.chip}`}
                      style={{ top, height, left: `calc(${(col / cols) * 100}% + 2px)`, width: `calc(${100 / cols}% - 4px)`, borderLeft: `4px solid ${style.hex}` }}
                    >
                      <span className="block font-semibold">{formatRange(e.start_time, e.end_time)}</span>
                      <span className="block truncate font-display text-sm font-semibold">{e.title}</span>
                      {height > 62 && <span className="block truncate opacity-80">{e.online ? "Online" : e.location.venue}</span>}
                    </Link>
                  );
                })}
                {isToday && now >= firstHour * 60 && now <= lastHour * 60 && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: ((now - firstHour * 60) / 60) * HOUR_PX }}>
                    <span className="-ml-1 h-2.5 w-2.5 rounded-full bg-clay" />
                    <span className="h-px flex-1 bg-clay" />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section aria-label="Event details" className="bg-sand/40 px-4 py-4 sm:px-6 md:border-t md:border-line lg:overflow-y-auto lg:border-l lg:border-t-0">
            {sorted.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center text-sm text-bark">
                <p>Nothing is listed for this day yet.</p>
                <p className="mt-2"><Link href="/weekly" className="font-semibold text-clay-700 hover:underline">See what happens every week</Link></p>
              </div>
            ) : (
              <ul className="space-y-3">
                {sorted.map((e) => (
                  <li key={e.id} className="rounded-2xl border border-line bg-card p-4" style={{ borderLeftWidth: 4, borderLeftColor: categoryStyle[e.category].hex }}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-bark/80">{formatRange(e.start_time, e.end_time)}</p>
                    <Link href={`/events/${e.id}`} className="mt-1 block font-display text-lg font-semibold leading-snug text-ink hover:text-clay-700">{e.title}</Link>
                    <p className="mt-0.5 text-sm text-bark">{e.online ? "Online" : [e.location.venue, e.address].filter(Boolean).join(" · ")}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <CategoryBadge category={e.category} />
                      {e.recurrence && <span className="text-xs font-semibold text-bark"><span aria-hidden="true">↻ </span>{e.recurrence}</span>}
                    </div>
                    {e.price && <p className="mt-2 line-clamp-2 text-sm text-bark">{e.price}</p>}
                    <div className="mt-3 border-t border-line pt-3"><EventRating event={e} /></div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <SaveButton kind="events" id={e.id} />
                      <SignupLink event={e} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
