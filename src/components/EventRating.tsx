"use client";
import Link from "next/link";
import type { Event } from "@/types";
import { useNetwork } from "@/lib/network";
import { rateEvent } from "@/lib/rating";
import { Stars } from "./Stars";

/** Compact star row for cards. Personalizes itself once a profile is known. */
export function EventRating({ event }: { event: Event }) {
  const { profile } = useNetwork();
  const r = rateEvent(event, profile);
  return (
    <p className="flex items-center gap-2 text-sm">
      <Stars value={r.stars} />
      <span className="sr-only">{r.stars} out of 5 stars.</span>
      <span className="truncate text-bark">{r.summary}</span>
    </p>
  );
}

/** Full rating panel for the event page: stars, the reasons behind them and a tip. */
export function EventInsights({ event }: { event: Event }) {
  const { profile } = useNetwork();
  const r = rateEvent(event, profile);
  return (
    <section aria-labelledby="rating-title" className="rounded-2xl border border-line bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="rating-title" className="text-lg font-semibold">Networking rating</h2>
        <p className="flex items-center gap-2">
          <Stars value={r.stars} className="text-xl" />
          <span className="text-sm font-semibold text-ink">{r.stars} of 5</span>
        </p>
      </div>
      <p className="mt-1 text-sm font-medium text-clay-700">{r.summary}{r.personalized ? "" : " in general"}</p>
      {r.reasons.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-bark">
          {r.reasons.map((x) => <li key={x} className="flex gap-2"><span aria-hidden="true" className="text-moss">✓</span>{x}</li>)}
        </ul>
      )}
      <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm text-bark"><span className="font-semibold text-ink">Going in: </span>{r.tip}</p>
      <p className="mt-4 text-xs text-bark/80">
        {r.personalized ? "Rated for your profession and goals. " : "This is the general rating. "}
        <Link href="/top-10#you" className="font-semibold text-clay-700 hover:underline">{r.personalized ? "Change what you're looking for" : "Tell us what you do to see your own"}</Link>
        {" · "}
        <Link href="/about#ratings" className="font-semibold text-clay-700 hover:underline">How ratings work</Link>
      </p>
    </section>
  );
}
