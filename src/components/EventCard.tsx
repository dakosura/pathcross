import Link from "next/link";
import type { Event } from "@/types";
import { formatRange } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { DateBlock } from "./DateBlock";
import { SaveButton } from "./SaveButton";
import { SignupLink } from "./SignupLink";

export function EventCard({ event }: { event: Event }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-card p-5 shadow-[0_1px_3px_rgba(42,36,25,0.06)] transition duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-[0_14px_34px_rgba(42,36,25,0.12)]">
      <div className="flex items-start gap-4">
        <DateBlock iso={event.date} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={event.category} />
            {event.placeholder ? (
              <span className="text-xs font-medium text-bark">Sample listing</span>
            ) : event.featured ? (
              <span className="text-xs font-semibold text-clay-700">★ Featured</span>
            ) : null}
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">
            <Link href={`/events/${event.id}`} className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-clay-700">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 truncate text-sm text-bark">by {event.organizer}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-1.5 text-sm text-bark">
        <div className="flex gap-2"><dt className="sr-only">Time</dt><span aria-hidden="true">◷</span><dd>{formatRange(event.start_time, event.end_time)}</dd></div>
        <div className="flex gap-2"><dt className="sr-only">Place</dt><span aria-hidden="true">⌖</span><dd className="line-clamp-1">{event.online ? "Online" : `${event.location.venue}, ${event.location.city}`}</dd></div>
      </dl>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <SaveButton kind="events" id={event.id} />
        <SignupLink event={event} />
      </div>
    </article>
  );
}
