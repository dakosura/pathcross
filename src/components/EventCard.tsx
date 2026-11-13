import Link from "next/link";
import type { Event } from "@/types";
import { formatDate, formatRange } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-line bg-card p-5 shadow-[0_1px_3px_rgba(42,36,25,0.06)] transition hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-[0_8px_24px_rgba(42,36,25,0.10)]"
    >
      <div className="flex items-center justify-between">
        <CategoryBadge category={event.category} />
        {event.featured && <span className="text-xs font-semibold text-clay-700">★ Featured</span>}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-ink group-hover:text-clay">{event.title}</h3>
      <p className="mt-1 text-sm text-bark">by {event.organizer}</p>
      <dl className="mt-4 space-y-1 text-sm text-bark">
        <div>{formatDate(event.date)} · {formatRange(event.start_time, event.end_time)}</div>
        <div>{event.location.venue}, {event.location.city}</div>
      </dl>
    </Link>
  );
}
