"use client";
import Link from "next/link";
import type { Event } from "@/types";
import { formatDate, formatTime } from "@/lib/format";
import { useNetwork } from "@/lib/network";
import { AddToCalendar } from "./AddToCalendar";
import { GoingButton } from "./GoingButton";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The events in My Network that fall in the current month and haven't happened yet, soonest first. */
export function PlannedMonth({ events, today }: { events: Event[]; today: string }) {
  const { saved, isGoing } = useNetwork();
  const month = today.slice(0, 7);
  const mine = events.filter((e) => saved.events.includes(e.id) && e.date.startsWith(month) && e.date >= today);

  return (
    <section aria-label="Planned this month" className="px-3 pb-2">
      <div className="flex items-baseline justify-between gap-3 px-2 pb-2 pt-1">
        <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-bark/70">Planned in {MONTHS[Number(month.slice(5)) - 1]}</h2>
        <Link href="/calendar#mine" className="text-xs font-semibold text-clay-700 hover:underline">Open my calendar →</Link>
      </div>
      {mine.length === 0 ? (
        <p className="rounded-xl bg-sand px-4 py-4 text-sm text-bark">Nothing planned yet this month. Add events from the Events tab, or tap <strong>I&apos;m going</strong> on any event.</p>
      ) : (
        <ul className="space-y-2">
          {mine.map((e) => (
            <li key={e.id} className="rounded-xl border border-line bg-white/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-bark/80">
                {formatDate(e.date, { weekday: "short", month: "short", day: "numeric" })} · {formatTime(e.start_time)}
                {isGoing(e.id) && <span className="ml-2 rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold text-white">Going</span>}
              </p>
              <Link href={`/events/${e.id}`} className="mt-0.5 block text-sm font-semibold leading-snug text-ink hover:text-clay-700">{e.title}</Link>
              <p className="truncate text-xs text-bark">{e.online ? "Online" : e.location.venue}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <GoingButton id={e.id} />
                <AddToCalendar event={e} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
