import Link from "next/link";
import type { ReactNode } from "react";
import type { Event } from "@/types";
import { formatDate, formatRange } from "@/lib/format";
import { ProfileSteps } from "./ProfileSteps";

/** Shared hero UI (headline panel + arrival card) layered over any map. */
export function HeroOverlay({
  target, arrived, ready, onReplay, children,
}: { target: Event; arrived: boolean; ready: boolean; onReplay: () => void; children: ReactNode }) {
  return (
    <section className="relative h-[720px] overflow-hidden bg-sand sm:h-[680px]">
      <div className="absolute inset-0">{children}</div>
      <div className="pointer-events-none relative mx-auto flex h-full max-w-6xl flex-col justify-between gap-4 px-4 py-6 sm:px-6 sm:py-10">
        <div className="pointer-events-auto max-w-xl rounded-xl bg-forest/95 p-5 text-cream shadow-xl backdrop-blur sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay-300">Honolulu · Events, clubs and people worth meeting</p>
          <h1 className="text-3xl font-semibold sm:text-5xl">
            Every good connection starts with <span className="italic text-clay-300">crossing paths.</span>
          </h1>
          <p className="mt-4 hidden text-cream/75 sm:block">
            Your one-stop shop for building a professional network in Honolulu. Find the events, clubs and groups worth your time, all in one place.
          </p>
          <div className="mt-5 sm:mt-6"><ProfileSteps tone="dark" /></div>
          <p className="mt-4 text-sm text-cream/70">Or <Link href="/events" className="font-semibold text-clay-300 hover:text-white">browse every event</Link>.</p>
        </div>

        <div className="flex items-end justify-between gap-4 pb-5 pl-28">
          <button
            onClick={onReplay}
            disabled={!ready}
            className="pointer-events-auto rounded-lg bg-card/95 px-3 py-2 text-sm font-medium text-forest shadow-md hover:bg-card disabled:opacity-50"
          >
            ↻ Replay
          </button>
          <div
            className={`pointer-events-auto w-full max-w-sm rounded-xl bg-card p-5 shadow-xl ring-1 ring-line transition duration-700 ${
              arrived ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-clay-700">Happening in Honolulu</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{target.title}</h2>
            <p className="mt-1 text-sm text-bark">
              {formatDate(target.date)} · {formatRange(target.start_time, target.end_time)}
              <br />
              {target.location.venue}
            </p>
            <Link href={`/events/${target.id}`} className="mt-4 inline-block rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-700">
              View event →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
