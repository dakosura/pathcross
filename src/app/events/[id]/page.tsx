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
      <Link href="/events" className="text-sm font-medium text-teal-600 hover:text-teal-700">← All events</Link>
      <div className="mt-6"><CategoryBadge category={ev.category} /></div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{ev.title}</h1>
      <p className="mt-2 text-navy-500">Organized by {ev.organizer}</p>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold">About this event</h2>
          <p className="mt-3 leading-relaxed text-navy-700">{ev.description}</p>
        </div>
        <aside className="h-fit rounded-2xl border border-navy-100 bg-navy-50 p-6 text-sm">
          <dl className="space-y-4">
            <div><dt className="font-semibold text-navy-900">When</dt><dd className="text-navy-700">{formatDate(ev.date, { weekday: "long", year: "numeric" })}<br />{formatRange(ev.start_time, ev.end_time)}</dd></div>
            <div><dt className="font-semibold text-navy-900">Where</dt><dd className="text-navy-700">{ev.location.venue}<br />{ev.location.city}</dd></div>
          </dl>
          <a href={ev.source_url} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-full bg-teal-600 py-3 text-center font-semibold text-white hover:bg-teal-700">
            View original listing
          </a>
        </aside>
      </div>
    </div>
  );
}
