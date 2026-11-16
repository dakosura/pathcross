import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  { n: "1", title: "Tell us what you want", body: "Describe the kind of networking you're after — your field, your goals, your style." },
  { n: "2", title: "Browse curated picks", body: "Events, a month-by-month calendar, and clubs by interest, without every listing dumped on you." },
  { n: "3", title: "Sign up and show up", body: "Each listing links to the organizer's own page to register. Add it to My Network to see it on your map." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How PathCross works</h1>
      <p className="mt-4 max-w-2xl text-lg text-bark">
        Good connections start with showing up in the right rooms. PathCross is a curated discovery platform for local professional events and communities — starting in Honolulu, beginning with financial professionals, and growing from there.
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
      <Link href="/events" className="mt-12 inline-block rounded-full bg-forest px-6 py-3 font-semibold text-cream hover:bg-forest-700">Browse events</Link>
      <Link href="/clubs" className="ml-3 mt-12 inline-block rounded-full px-6 py-3 font-semibold text-forest ring-1 ring-forest/25 hover:bg-moss-50">Clubs &amp; Programs</Link>
    </div>
  );
}
