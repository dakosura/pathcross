import type { Event } from "@/types";
import { EventCard } from "./EventCard";

export function EventGrid({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return <p className="rounded-xl bg-sand p-10 text-center text-bark">No events match your filters yet.</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((ev) => <EventCard key={ev.id} event={ev} />)}
    </div>
  );
}
