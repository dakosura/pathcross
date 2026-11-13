import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { EventGrid } from "@/components/EventGrid";
import { getFeaturedEvents, getTopList } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function Home() {
  const featured = await getFeaturedEvents();
  const top = await getTopList("financial-advisors");

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title="Featured events" subtitle="Hand-picked gatherings happening soon in Honolulu." href="/events" />
        <EventGrid events={featured.slice(0, 3)} />
      </section>
      {top && (
        <section className="bg-navy-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHeading title="Top picks" subtitle={top.title} href="/top-10" cta="See the full list" />
            <ol className="grid gap-4 md:grid-cols-2">
              {top.items.slice(0, 4).map((ev, i) => (
                <li key={ev.id}>
                  <Link href={`/events/${ev.id}`} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 hover:ring-teal-400">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-50 font-bold text-teal-700">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-navy-900">{ev.title}</p>
                      <p className="text-sm text-navy-500">{formatDate(ev.date)} · {ev.location.venue}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
