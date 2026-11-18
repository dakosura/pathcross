import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "PathCross helps Honolulu professionals spend their evenings in the right rooms. See how we rate and rank networking events and clubs from 1 to 5 stars for meeting people.",
};

const steps = [
  { n: "1", title: "Tell us what you do", body: "Pick your profession and what you want from your network: clients, partners, mentors, a new job, or a wider circle. It takes two taps and you can skip it." },
  { n: "2", title: "See what's worth your time", body: "Every event gets a networking rating from 1 to 5 stars, with the reasons behind it and a tip for making the most of it. Your Top 10 re-ranks around you." },
  { n: "3", title: "Sign up and show up", body: "Each listing links to the organizer's own page to register. Add it to My Network to plan your week and see it on your map." },
];

const different = [
  { title: "Rated, not just listed", body: "Ticketing sites show you everything. PathCross tells you which events are actually good for meeting people, and why, so you stop spending evenings on rooms that go nowhere." },
  { title: "Matched to you", body: "A founder and a financial advisor shouldn't see the same top picks. Your profession and goals shape every rating, so your time goes to the rooms that matter for your work." },
  { title: "Clubs as well as events", body: "Gyms, golf, member clubs, yacht and paddling clubs, with how to join and posted prices, because the strongest professional relationships are built between events, not at them." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Spend your time in the right rooms</h1>
      <p className="mt-4 max-w-2xl text-lg text-bark">
        Your next client, collaborator or career move is probably in a room you haven&apos;t found yet. PathCross is the most efficient way for Honolulu professionals to find the networking events, clubs and groups worth showing up to, rated for how likely you are to meet the right people.
      </p>
      <p className="mt-3 max-w-2xl text-bark">
        Your time is limited. Stop scrolling through listings and guessing. See what&apos;s on, know why it&apos;s worth it, and walk in with a plan. It&apos;s free.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-line bg-card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-clay-50 font-bold text-clay-700">{s.n}</span>
            <h2 className="mt-4 font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-bark">{s.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-semibold">Why not just use a ticketing site?</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {different.map((d) => (
          <div key={d.title}>
            <h3 className="font-semibold text-ink">{d.title}</h3>
            <p className="mt-2 text-sm text-bark">{d.body}</p>
          </div>
        ))}
      </div>

      <section id="ratings" className="mt-16 scroll-mt-24 rounded-2xl border border-line bg-sand p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">How the networking rating works</h2>
        <p className="mt-3 text-bark">
          The stars are calculated by PathCross. They are not reviews from attendees, and organizers can&apos;t pay to change them. Each rating looks at:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-bark">
          <li><strong className="text-ink">Format.</strong> An open mixer or pau hana scores higher than a seated class, and in-person scores higher than online.</li>
          <li><strong className="text-ink">Size and host.</strong> Small groups and established hosts such as the Chamber get a lift.</li>
          <li><strong className="text-ink">You.</strong> If you&apos;ve told us your profession and goals, the topic and format are weighed against them.</li>
        </ul>
        <p className="mt-4 text-sm text-bark">Every rating shows its reasons on the event page, so you can judge it for yourself. Ratings are a guide, not a guarantee of who will be in the room.</p>
      </section>

      <Link href="/events" className="mt-12 inline-block rounded-full bg-forest px-6 py-3 font-semibold text-cream hover:bg-forest-700">Find your next event</Link>
      <Link href="/clubs" className="ml-3 mt-12 inline-block rounded-full px-6 py-3 font-semibold text-forest ring-1 ring-forest/25 hover:bg-moss-50">Clubs &amp; Programs</Link>
    </div>
  );
}
