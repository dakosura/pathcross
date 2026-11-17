import type { Metadata } from "next";
import Link from "next/link";
import { getTopList } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";

export const metadata: Metadata = { title: "Top 10 for Financial Advisors" };

export default async function TopTenPage() {
  const list = (await getTopList("financial-advisors"))!;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-clay-700">Top 10 · {list.audience}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{list.title}</h1>
      <p className="mt-3 text-bark">{list.description}</p>
      {list.items.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-clay-300 bg-card p-8 text-center text-bark">
          No upcoming events are listed right now. <Link href="/events" className="font-semibold text-clay-700 hover:underline">Browse all events</Link>
        </p>
      )}
      <ol className="mt-10 space-y-4">
        {list.items.map((ev, i) => (
          <li key={ev.id}>
            <Link href={`/events/${ev.id}`} className="flex items-start gap-4 rounded-xl border border-line bg-card p-5 hover:border-clay-300 hover:shadow-md">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-forest font-bold text-white">{i + 1}</span>
              <div className="min-w-0">
                <h2 className="font-semibold text-ink">{ev.title}</h2>
                <p className="mt-1 text-sm text-bark">{formatDate(ev.date)} · {formatTime(ev.start_time)} · {ev.location.venue}</p>
                <p className="mt-1 text-sm text-bark/80">Hosted by {ev.organizer}</p>
                {ev.price && <p className="mt-1 line-clamp-1 text-sm text-bark/80">{ev.price}</p>}
                <div className="mt-2"><CategoryBadge category={ev.category} /></div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-bark/80">
        Rankings favor finance topics and in-person business mixers, and update automatically. <Link href="/events" className="font-semibold text-clay-700 hover:underline">See every event</Link>
      </p>
    </div>
  );
}
