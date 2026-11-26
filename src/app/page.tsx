import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { PersonalFeatured } from "@/components/PersonalFeatured";
import { ThisWeek } from "@/components/ThisWeek";
import { DateBlock } from "@/components/DateBlock";
import { InterestIcon } from "@/components/InterestIcon";
import { SaveButton } from "@/components/SaveButton";
import { SignupLink } from "@/components/SignupLink";
import { clubs, clubsByInterest } from "@/lib/clubs";
import { getCalendarEvents, getEvents, getFeaturedEvents, getToday } from "@/lib/data";
import { addDays } from "@/lib/recurring";
import { formatRange } from "@/lib/format";
import { interests } from "@/lib/interests";

// The homepage lives at "/", not "/index", so say so explicitly (the site-wide "./" resolves to /index here).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  // Next replaces the whole openGraph block per page, so repeat the layout's values.
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    title: "PathCross: Efficient Networking for Business Professionals in Honolulu",
    description: site.description,
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "PathCross" }],
  },
};

export default async function Home() {
  const [everything, featured, calendar, today] = await Promise.all([getEvents(), getFeaturedEvents(), getCalendarEvents(), getToday()]);
  const weekEvents = calendar.filter((e) => e.date <= addDays(today, 14));
  // Weekly markets and run clubs have their own page; keep them out of the headline lists.
  const all = everything.filter((e) => !e.recurrence);
  const spotlight = (featured.length >= 3 ? featured : all).slice(0, 3);
  const next = all.slice(0, 5);
  const stats = [
    { n: everything.length, label: "upcoming events" },
    { n: clubs.filter((c) => !c.pending).length, label: "clubs & groups listed" },
    { n: interests.length, label: "interests to explore" },
  ];

  return (
    <>
      <Hero />

      <section className="border-b border-line bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-line px-4 sm:px-6">
          {stats.map((s) => (
            <div key={s.label} className="px-3 py-6 text-center sm:py-8">
              <dd className="font-display text-3xl font-semibold text-forest sm:text-4xl">{s.n}</dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-bark sm:text-sm">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-6 rounded-2xl border border-line bg-card p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">Made for what you do</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Not every event is worth your evening.</h2>
            <p className="mt-2 max-w-2xl text-bark">Tell us your profession and what you&apos;re looking for. PathCross rates every event from 1 to 5 stars for meeting people and ranks the ten most worth your time.</p>
          </div>
          <Link href="/top-10" className="rounded-full bg-clay px-6 py-3 text-center font-semibold text-white transition hover:bg-clay-700">See my top 10</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <SectionHeading title="This week for you" subtitle="The few events most worth your time this week, plus one weekly routine." href="/this-week" cta="Your full week" />
        <ThisWeek events={weekEvents} today={today} picks={3} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <PersonalFeatured pool={all.slice(0, 40)} fallback={spotlight} />
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-4 rounded-2xl bg-sand p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Something every week</h2>
            <p className="mt-1 max-w-2xl text-sm text-bark sm:text-base">Run clubs, volunteer shifts and Friday fireworks, listed by day of the week so there is always somewhere to go.</p>
          </div>
          <Link href="/weekly" className="rounded-full bg-forest px-6 py-3 text-center font-semibold text-cream transition hover:bg-forest-700">See the weekly lineup</Link>
        </div>
      </section>

      <section className="bg-sand mt-16 sm:mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading title="Explore by interest" subtitle="Clubs, programs and places to belong, beyond the next mixer." href="/clubs" cta="All clubs & programs" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((i) => {
              const count = clubsByInterest(i.id).length;
              return (
                <Link key={i.id} href={`/clubs/${i.id}`} className="group flex flex-col rounded-2xl bg-card p-5 ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(42,36,25,0.12)] hover:ring-clay-300">
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${i.tile}`}><InterestIcon id={i.id} /></span>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-ink group-hover:text-clay-700">{i.short}</h3>
                  <p className="mt-1 flex-1 text-sm text-bark">{i.blurb}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-forest">{count ? `${count} listed` : "Coming soon"}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-forest bg-topo text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-300">My Network</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">See where your paths <span className="italic text-clay-300">already cross.</span></h2>
            <p className="mt-4 max-w-md text-cream/75">Pick the clubs you belong to and the events you&apos;re going to. PathCross puts each one on your own map of Oʻahu.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/my-network" className="rounded-full bg-clay px-6 py-3 font-semibold text-white transition hover:bg-clay-700">Build my map</Link>
              <Link href="/clubs" className="rounded-full px-6 py-3 font-semibold text-cream ring-1 ring-cream/30 transition hover:bg-cream/10">Browse clubs</Link>
            </div>
          </div>
          <svg viewBox="0 0 520 320" className="w-full" role="img" aria-label="Illustration of map pins joined by dotted paths">
            <path d="M40 250 C120 150 160 260 250 170 S400 60 480 110" fill="none" stroke="#d4a574" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
            <path d="M70 80 C160 120 200 60 250 170 S380 280 470 240" fill="none" stroke="#f7f4ef" strokeOpacity="0.45" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
            {[[40, 250, "#c17f4a", 9], [480, 110, "#c17f4a", 9], [70, 80, "#4a6b4f", 9], [470, 240, "#2f6f7a", 9]].map(([x, y, c, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={c as string} stroke="#f7f4ef" strokeWidth="3" />
            ))}
            <circle cx="250" cy="170" r="30" fill="#c17f4a" fillOpacity="0.22" />
            <circle cx="250" cy="170" r="14" fill="#c17f4a" stroke="#f7f4ef" strokeWidth="4" />
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="grid items-center gap-4 rounded-2xl border border-line bg-card p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">For organizers</p>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Run a club, network or event in Honolulu?</h2>
            <p className="mt-1 max-w-2xl text-sm text-bark sm:text-base">Tell us about it and reach people looking for their next room. It takes a few minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-full bg-clay px-6 py-3 text-center font-semibold text-white transition hover:bg-clay-700">List yours</Link>
            <Link href="/faq" className="rounded-full px-6 py-3 text-center font-semibold text-forest ring-1 ring-forest/25 transition hover:bg-moss-50">FAQ</Link>
          </div>
        </div>
      </section>

      {next.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading title="Coming up next" subtitle="The next few dates on the calendar." href="/calendar" cta="Open the calendar" />
          <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
            {next.map((ev) => (
              <li key={ev.id} className="group relative flex items-center gap-4 p-4 transition hover:bg-sand/60 sm:gap-5 sm:p-5">
                <DateBlock iso={ev.date} />
                <div className="min-w-0 flex-1">
                  <Link href={`/events/${ev.id}`} className="block truncate font-display text-lg font-semibold text-ink after:absolute after:inset-0 group-hover:text-clay-700">{ev.title}</Link>
                  <p className="truncate text-sm text-bark">{formatRange(ev.start_time, ev.end_time)} · {ev.online ? "Online" : ev.location.venue}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4"><SaveButton kind="events" id={ev.id} /><span className="hidden sm:block"><SignupLink event={ev} /></span></div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
