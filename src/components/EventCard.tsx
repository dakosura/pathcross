import Link from "next/link";
import type { Event } from "@/types";
import { formatDate, formatRange } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <CategoryBadge category={event.category} />
        {event.featured && <span className="text-xs font-semibold text-teal-600">★ Featured</span>}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-navy-900 group-hover:text-teal-700">{event.title}</h3>
      <p className="mt-1 text-sm text-navy-500">by {event.organizer}</p>
      <dl className="mt-4 space-y-1 text-sm text-navy-700">
        <div>{formatDate(event.date)} · {formatRange(event.start_time, event.end_time)}</div>
        <div>{event.location.venue}, {event.location.city}</div>
      </dl>
    </Link>
  );
}
