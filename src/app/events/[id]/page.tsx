import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryBadge } from "@/components/CategoryBadge";
import { events, getEvent } from "@/lib/data";
import { formatDate, formatRange } from "@/lib/format";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const ev = await getEvent(id);
  return { title: ev?.title ?? "Event" };
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const ev = await getEvent(id);
  if (!ev) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/events" className="text-sm font-medium text-clay-700 hover:text-clay">← All events</Link>
      <div className="mt-6"><CategoryBadge category={ev.category} /></div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{ev.title}</h1>
      <p className="mt-2 text-bark">Organized by {ev.organizer}</p>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold">About this event</h2>
          <p className="mt-3 leading-relaxed text-bark">{ev.description}</p>
          {ev.note && <p className="mt-4 rounded-md bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">{ev.note}</p>}
          {ev.placeholder && <p className="mt-4 rounded-md bg-sand px-4 py-3 text-sm text-bark">This is a sample listing, not a confirmed event.</p>}
        </div>
        <aside className="h-fit rounded-xl border border-line bg-sand p-6 text-sm">
          <dl className="space-y-4">
            <div><dt className="font-semibold text-ink">When</dt><dd className="text-bark">{formatDate(ev.date, { weekday: "long", year: "numeric" })}<br />{formatRange(ev.start_time, ev.end_time)}</dd></div>
            <div><dt className="font-semibold text-ink">Where</dt><dd className="text-bark">{ev.location.venue}<br />{ev.address ?? ev.location.city}</dd></div>
            {ev.price && <div><dt className="font-semibold text-ink">Price</dt><dd className="text-bark">{ev.price}</dd></div>}
          </dl>
          {!ev.placeholder && (
            <a href={ev.registration_url ?? ev.source_url} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-md bg-forest py-3 text-center font-semibold text-white hover:bg-forest-700">
              {ev.registration_url ? "Register" : "View original listing"}
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
