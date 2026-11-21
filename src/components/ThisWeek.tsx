"use client";
import Link from "next/link";
import type { Event } from "@/types";
import { formatDate, formatRange } from "@/lib/format";
import { useNetwork } from "@/lib/network";
import { hasProfile } from "@/lib/profile";
import { weekPlan } from "@/lib/week";
import { AddToCalendar } from "./AddToCalendar";
import { DateBlock } from "./DateBlock";
import { MatchBadge } from "./EventRating";
import { GoingButton } from "./GoingButton";
import { SignupLink } from "./SignupLink";
import { Stars } from "./Stars";

type Row = ReturnType<typeof weekPlan>["picks"][number];

function Item({ row, tone = "plain" }: { row: Row | NonNullable<ReturnType<typeof weekPlan>["routine"]>; tone?: "plain" | "routine" }) {
  const { ev, rating } = row;
  const later = "later" in row && row.later;
  return (
    <li className={`rounded-2xl border p-4 sm:p-5 ${tone === "routine" ? "border-moss/30 bg-moss-50" : "border-line bg-card"}`}>
      <div className="flex items-start gap-4">
        <DateBlock iso={ev.date} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars value={rating.stars} />
            <span className="sr-only">{rating.stars} out of 5 stars.</span>
            <span className="text-sm font-medium text-clay-700">{rating.summary}</span>
            <MatchBadge rating={rating} />
            {later && <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bark">Next week</span>}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink">
            <Link href={`/events/${ev.id}`} className="hover:text-clay-700">{ev.title}</Link>
          </h3>
          <p className="mt-1 text-sm text-bark">{formatDate(ev.date, { weekday: "long" })} · {formatRange(ev.start_time, ev.end_time)} · {ev.online ? "Online" : ev.location.venue}</p>
          {ev.recurrence && <p className="mt-0.5 text-xs font-semibold text-bark"><span aria-hidden="true">↻ </span>{ev.recurrence}</p>}
          {rating.reasons[0] && <p className="mt-2 text-sm text-bark"><span aria-hidden="true" className="text-moss">✓ </span>{rating.reasons[0]}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <GoingButton id={ev.id} />
            <AddToCalendar event={ev} />
            <SignupLink event={ev} />
          </div>
        </div>
      </div>
    </li>
  );
}

/** The best few events this week for this visitor, plus one repeating activity to make a habit of. */
export function ThisWeek({ events, today, picks = 5, showAllLink = false }: { events: Event[]; today: string; picks?: number; showAllLink?: boolean }) {
  const { profile } = useNetwork();
  const personal = hasProfile(profile);
  const plan = weekPlan(events, today, profile, picks);

  return (
    <div>
      {!personal && (
        <p className="mb-5 rounded-xl bg-sand px-4 py-3 text-sm text-bark">
          These are the best picks for most people.{" "}
          <Link href="/this-week#you" className="font-semibold text-clay-700 hover:underline">Tell us what you do</Link> and they become yours.
        </p>
      )}
      {plan.picks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-clay-300 bg-card p-8 text-center text-bark">
          Nothing is listed for the rest of this week yet. <Link href="/calendar" className="font-semibold text-clay-700 hover:underline">Open the calendar</Link>
        </p>
      ) : (
        <ol className="space-y-4">{plan.picks.map((r) => <Item key={r.ev.id} row={r} />)}</ol>
      )}
      {plan.routine && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-moss">Your weekly routine</h3>
          <ul><Item row={plan.routine} tone="routine" /></ul>
        </div>
      )}
      {showAllLink && (
        <p className="mt-6 text-sm"><Link href="/this-week" className="font-semibold text-clay-700 hover:underline">See your full week →</Link></p>
      )}
    </div>
  );
}
