import Link from "next/link";
import type { ReactNode } from "react";
import type { Event } from "@/types";
import { formatDate, formatRange } from "@/lib/format";
import { ProfileSteps } from "./ProfileSteps";

/** Shared hero UI (headline panel + arrival card) layered over any map. */
export function HeroOverlay({
  target, arrived, ready, explore = false, cycleMs = 10_000, onReplay, replayClassName = "left-3", children,
}: { target: Event; arrived: boolean; ready: boolean; explore?: boolean; cycleMs?: number; onReplay: () => void; /** Horizontal position of Replay in the map's bottom-left corner. */ replayClassName?: string; children: ReactNode }) {
  // Phones: headline panel, then the map, then the event card, stacked so the pins stay clear of the panel.
  // From `lg` (1024px) up: the map fills the section and the panel and card float over it.
  // Anything narrower keeps the stack, so the headline panel never covers the map.
  return (
    <section className="relative flex flex-col bg-sand lg:block lg:h-[800px] lg:overflow-hidden">
      <div className="relative order-2 h-[420px] sm:h-[500px] lg:absolute lg:inset-0 lg:h-auto">
        {children}
        {/* Tucked into the bottom-left corner of the map, out of the way of the panel and the event card. */}
        <button
          onClick={onReplay}
          disabled={!ready}
          className={`absolute bottom-3 z-10 rounded-lg bg-card/90 px-3 py-1.5 text-xs font-medium text-forest shadow-md hover:bg-card disabled:opacity-50 ${replayClassName}`}
        >
          ↻ Replay
        </button>
      </div>

      <div className="order-1 px-4 py-6 sm:px-6 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:mx-auto lg:max-w-6xl lg:py-10">
        <div className="pointer-events-auto mx-auto max-w-2xl rounded-xl bg-forest/95 p-5 text-cream shadow-xl backdrop-blur sm:p-8 lg:mx-0 lg:max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay-300">Honolulu · Networking made efficient for business professionals</p>
          <h1 className="text-3xl font-semibold sm:text-5xl">
            Tell us what you do. <span className="italic text-clay-300">Get the events most worth your time.</span>
          </h1>
          <p className="mt-4 hidden text-cream/75 sm:block">
            Two quick questions, and PathCross ranks Honolulu&apos;s networking events, clubs and groups for your profession and goals. One place to build your network.
          </p>
          <div className="mt-5 sm:mt-6"><ProfileSteps tone="dark" /></div>
          <p className="mt-4 text-sm text-cream/70">Or <Link href="/events" className="font-semibold text-clay-300 hover:text-white">browse every event</Link>.</p>
        </div>
      </div>

      <div className="order-3 mx-auto w-full max-w-2xl px-4 pb-8 pt-4 sm:px-6 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:max-w-6xl lg:pb-10 lg:pt-0">
        <div className="flex items-end justify-end gap-4 lg:pb-5">
          <div
            className={`pointer-events-auto relative w-full overflow-hidden rounded-xl bg-card shadow-xl ring-1 ring-line transition duration-700 ${explore ? "max-w-md px-4 py-2.5" : "max-w-sm p-5"} ${
              arrived ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            {explore ? (
              // A slim strip once the camera pulls back, so Honolulu stays in view. It changes event every `cycleMs`.
              <div key={target.id} className="rise flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-ink">{target.title}</h2>
                  <p className="truncate text-xs text-bark">{formatDate(target.date)} · {formatRange(target.start_time, target.end_time)} · {target.location.venue}</p>
                </div>
                <Link href={`/events/${target.id}`} className="shrink-0 rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-700">View →</Link>
                <span aria-hidden="true" className="cycle-bar absolute inset-x-0 bottom-0 h-0.5 origin-left bg-clay/70" style={{ animation: `cycle ${cycleMs}ms linear forwards` }} />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
