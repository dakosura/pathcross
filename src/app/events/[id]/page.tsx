import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCalendar } from "@/components/AddToCalendar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DateBlock } from "@/components/DateBlock";
import { GoingButton } from "@/components/GoingButton";
import { EventInsights } from "@/components/EventRating";
import { SaveButton } from "@/components/SaveButton";
import { SignupLink } from "@/components/SignupLink";
import { clubById } from "@/lib/clubs";
import { events, getEvent } from "@/lib/data";
import { formatDate, formatRange } from "@/lib/format";
import { site } from "@/lib/site";
import type { Event } from "@/types";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const ev = await getEvent(id);
  if (!ev) return { title: "Event" };
  const where = ev.online ? "Online" : `${ev.location.venue}, ${ev.location.city}`;
  const summary = ev.description.replace(/\s+/g, " ").slice(0, 110).trim();
  return {
    title: `${ev.title}, ${formatDate(ev.date, { year: "numeric" })}`,
    description: `${formatDate(ev.date, { weekday: "long" })} at ${where}. ${summary}${summary.length >= 110 ? "…" : ""}`,
  };
}

/** Reads a price Google can use from free-form text like "Free" or "YP $15 · Public $40". Returns nothing when unclear. */
function eventOffer(ev: Event) {
  const text = ev.price?.trim();
  if (!text) return undefined;
  const amounts = [...text.matchAll(/\$\s?(\d+(?:\.\d{1,2})?)/g)].map((m) => Number(m[1]));
  const price = amounts.length ? Math.min(...amounts) : /\bfree\b/i.test(text) ? 0 : undefined;
  if (price === undefined) return undefined;
  return {
    "@type": "Offer",
    price,
    priceCurrency: "USD",
    url: ev.registration_url ?? ev.source_url,
    availability: /sold out/i.test(ev.note ?? "") ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
  };
}

/** schema.org Event data, which lets Google show the date and place in results. */
function eventJsonLd(ev: Event) {
  // Hawaiʻi has no daylight saving, so the offset is always -10:00.
  const at = (t: string) => `${ev.date}T${t}:00-10:00`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    description: ev.description.slice(0, 500) || undefined,
    startDate: at(ev.start_time),
    endDate: ev.end_time !== ev.start_time ? at(ev.end_time) : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: `https://schema.org/${ev.online ? "OnlineEventAttendanceMode" : "OfflineEventAttendanceMode"}`,
    location: ev.online
      ? { "@type": "VirtualLocation", url: ev.registration_url ?? ev.source_url }
      : { "@type": "Place", name: ev.location.venue, address: ev.address ?? `${ev.location.city}, HI` },
    organizer: { "@type": "Organization", name: ev.organizer, url: ev.source_url },
    performer: { "@type": "Organization", name: ev.organizer },
    image: [`${site.url}/brand/og.jpg`],
    offers: eventOffer(ev),
    url: `${site.url}/events/${ev.id}`,
  };
}

// `params` is read inside <Suspense> so navigation to this route stays instant.
export default function EventPage(props: PageProps<"/events/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-sand" /></div>}>
      <Content params={props.params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/events/[id]">, "params">) {
  const { id } = await params;
  const ev = await getEvent(id);
  if (!ev) notFound();
  const club = clubById(ev.club_id);

  return (
    <>
      {!ev.placeholder && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(ev)).replace(/</g, "\\u003c") }} />}
      <div className="bg-forest bg-topo text-cream">
        <div className="rise mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Link href="/events" className="text-sm font-medium text-clay-300 hover:text-white">← All events</Link>
          <div className="mt-6 flex items-start gap-5">
            <DateBlock iso={ev.date} tone="dark" />
            <div className="min-w-0">
              <CategoryBadge category={ev.category} />
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{ev.title}</h1>
              <p className="mt-2 text-cream/75">Organized by {ev.organizer}{ev.recurrence ? ` · ${ev.recurrence}` : ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold">About this event</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-bark">{ev.description || "See the organizer's listing for details."}</p>
          {ev.note && <p className="mt-4 rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">{ev.note}</p>}
          {ev.placeholder && <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm text-bark">This is a sample listing, not a confirmed event.</p>}
          {!ev.placeholder && <div className="mt-8"><EventInsights event={ev} /></div>}
          {club && (
            <p className="mt-8 text-sm text-bark">
              Hosted by{" "}
              <Link href={`/clubs/${club.interest}/${club.id}`} className="font-semibold text-clay-700 hover:underline">{club.name}</Link>
            </p>
          )}
        </div>
        <aside className="h-fit space-y-5 rounded-2xl border border-line bg-sand p-6 text-sm">
          <dl className="space-y-4">
            <div><dt className="font-semibold text-ink">When</dt><dd className="text-bark">{ev.recurrence && <span className="font-medium text-ink">{ev.recurrence}<br /></span>}{ev.recurrence ? "Next: " : ""}{formatDate(ev.date, { weekday: "long", year: "numeric" })}<br />{formatRange(ev.start_time, ev.end_time)}</dd></div>
            <div><dt className="font-semibold text-ink">Where</dt><dd className="text-bark">{ev.location.venue}{!ev.online && <><br />{ev.address ?? ev.location.city}</>}</dd></div>
            {ev.price && <div><dt className="font-semibold text-ink">Price</dt><dd className="text-bark">{ev.price}</dd></div>}
          </dl>
          <div className="space-y-2.5">
            <SignupLink event={ev} variant="button" />
            <GoingButton id={ev.id} size="lg" />
            <SaveButton kind="events" id={ev.id} size="lg" />
            {!ev.placeholder && <AddToCalendar event={ev} size="lg" />}
          </div>
          {!ev.placeholder && <p className="text-xs text-bark/80">Sign-up happens on the organizer&apos;s site. PathCross doesn&apos;t sell tickets.</p>}
        </aside>
      </div>
    </>
  );
}
