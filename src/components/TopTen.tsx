"use client";
import Link from "next/link";
import type { Event } from "@/types";
import { formatDate, formatTime } from "@/lib/format";
import { useNetwork } from "@/lib/network";
import { hasProfile, professionLabel } from "@/lib/profile";
import { rankEvents } from "@/lib/rating";
import { CategoryBadge } from "./CategoryBadge";
import { ProfileFields } from "./ProfileFields";
import { Stars } from "./Stars";

/** The ten best-rated upcoming events for whoever is looking, with the profile form that drives it. */
export function TopTen({ events }: { events: Event[] }) {
  const { profile, saveProfile, user, openPrompt, error } = useNetwork();
  const personalized = hasProfile(profile);
  const top = rankEvents(events, profile);
  const who = profile.profession && profile.profession !== "other" && profile.profession !== "social" ? professionLabel(profile.profession) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <h2 className="text-2xl font-semibold">{personalized ? (who ? `Your top 10 as a ${who.toLowerCase()}` : "Your top 10") : "Top 10 right now"}</h2>
        <p className="mt-1 text-sm text-bark">
          {personalized ? "Ranked for what you told us. Change your answers and the list re-ranks instantly." : "The best upcoming events for meeting people. Tell us about you and this list becomes yours."}
        </p>
        {top.length === 0 && (
          <p className="mt-8 rounded-xl border border-dashed border-clay-300 bg-card p-8 text-center text-bark">
            No upcoming events are listed right now. <Link href="/events" className="font-semibold text-clay-700 hover:underline">Browse all events</Link>
          </p>
        )}
        <ol className="mt-6 space-y-4">
          {top.map(({ ev, rating }, i) => (
            <li key={ev.id}>
              <Link href={`/events/${ev.id}`} className="flex items-start gap-4 rounded-2xl border border-line bg-card p-5 transition hover:border-clay-300 hover:shadow-md">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-forest font-bold text-cream">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={rating.stars} />
                    <span className="sr-only">{rating.stars} out of 5 stars.</span>
                    <span className="text-sm font-medium text-clay-700">{rating.summary}</span>
                  </div>
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink">{ev.title}</h3>
                  <p className="mt-1 text-sm text-bark">{formatDate(ev.date)} · {formatTime(ev.start_time)} · {ev.online ? "Online" : ev.location.venue}</p>
                  {rating.reasons[0] && <p className="mt-2 text-sm text-bark"><span aria-hidden="true" className="text-moss">✓ </span>{rating.reasons[0]}</p>}
                  <div className="mt-3"><CategoryBadge category={ev.category} /></div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <aside id="you" className="h-fit scroll-mt-24 rounded-2xl border border-line bg-sand p-6 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">About you</p>
        <h2 className="mt-1 text-xl font-semibold">Make this list yours</h2>
        <p className="mt-2 mb-5 text-sm text-bark">Two questions. Every rating on PathCross then reflects what you do and what you want.</p>
        <ProfileFields value={profile} onChange={saveProfile} idPrefix="top10" />
        {error && <p role="alert" className="mt-3 text-sm font-medium text-clay-700">{error}</p>}
        <p className="mt-5 text-xs text-bark/80">
          {user ? "Saved to your account." : "Saved in this browser only."}
          {!user && <> <button type="button" onClick={openPrompt} className="font-semibold text-clay-700 hover:underline">Create a free login</button> to keep it on every device.</>}
        </p>
      </aside>
    </div>
  );
}
