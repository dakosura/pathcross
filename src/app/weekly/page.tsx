import type { Metadata } from "next";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PageHeader } from "@/components/PageHeader";
import { SaveButton } from "@/components/SaveButton";
import { getWeeklySeries } from "@/lib/data";
import { formatDate, formatRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Weekly events in Honolulu: run clubs, volunteering, meetups",
  description: "What happens every week on Oʻahu: free run clubs, volunteer shifts, meetups and Friday fireworks, listed by day of the week.",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function WeeklyPage() {
  const items = await getWeeklySeries();
  // A series on several days appears under each of them; one-date series go last.
  const byDay = DAYS.map((name, i) => {
    const dow = (i + 1) % 7;
    return { name, items: items.filter(({ series: s }) => !s.dates && s.days?.includes(dow)).sort((a, b) => a.series.start.localeCompare(b.series.start)) };
  }).filter((d) => d.items.length);
  const select = items.filter(({ series: s }) => s.dates);

  return (
    <>
      <PageHeader eyebrow="Oʻahu · Every week" title="The weekly lineup">
        Free run clubs, volunteer shifts, meetups and fireworks that come around again and again, so there is always something to join. Each links back to its organizer.
      </PageHeader>
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6">
        {byDay.map((d) => (
          <section key={d.name} aria-labelledby={`day-${d.name}`}>
            <h2 id={`day-${d.name}`} className="text-2xl font-semibold">{d.name}</h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {d.items.map(({ series: s, event }) => (
                <li key={s.id} className="group relative flex items-start gap-4 p-4 transition hover:bg-sand/60 sm:p-5">
                  <p className="w-28 shrink-0 text-sm font-semibold text-forest sm:w-36">{formatRange(s.start, s.end ?? s.start)}</p>
                  <div className="min-w-0 flex-1">
                    <Link href={`/events/${s.id}`} className="font-display text-lg font-semibold leading-snug text-ink after:absolute after:inset-0 group-hover:text-clay-700">{s.title}</Link>
                    <p className="mt-0.5 text-sm text-bark">{event.location.venue}{event.location.city !== "Honolulu" ? `, ${event.location.city}` : ""}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <CategoryBadge category={s.category} />
                      {(s.weeks || (s.days && s.days.length > 1)) && <span className="text-xs font-medium text-bark">{event.recurrence}</span>}
                    </div>
                    <div className="mt-3"><SaveButton kind="events" id={s.id} /></div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {select.length > 0 && (
          <section aria-labelledby="select-dates">
            <h2 id="select-dates" className="text-2xl font-semibold">On select dates</h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {select.map(({ series: s, event }) => (
                <li key={s.id} className="group relative flex items-start gap-4 p-4 transition hover:bg-sand/60 sm:p-5">
                  <p className="w-28 shrink-0 text-sm font-semibold text-forest sm:w-36">{formatDate(event.date)}<br /><span className="font-normal text-bark">{formatRange(s.start, s.end ?? s.start)}</span></p>
                  <div className="min-w-0 flex-1">
                    <Link href={`/events/${s.id}`} className="font-display text-lg font-semibold leading-snug text-ink after:absolute after:inset-0 group-hover:text-clay-700">{s.title}</Link>
                    <p className="mt-0.5 text-sm text-bark">{event.location.venue}</p>
                    <div className="mt-2"><CategoryBadge category={s.category} /></div>
                    <div className="mt-3"><SaveButton kind="events" id={s.id} /></div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-sm text-bark">Schedules change. Hours come from each organizer, or from local guides as of November 2026, so check the listing before you go. Know one we are missing? Email <a href="mailto:hello@joinpathcross.com" className="font-semibold text-clay-700 hover:underline">hello@joinpathcross.com</a>.</p>
      </div>
    </>
  );
}
