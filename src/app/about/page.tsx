import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  { n: "1", title: "Tell us what you want", body: "Describe the kind of networking you're after — your field, your goals, your style." },
  { n: "2", title: "Browse curated picks", body: "We hand-select events, groups, and communities instead of dumping every listing on you." },
  { n: "3", title: "Show up and connect", body: "Follow through to the organizer's page, register, and meet people worth knowing." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How PathCross works</h1>
      <p className="mt-4 max-w-2xl text-lg text-navy-500">
        Good connections start with showing up in the right rooms. PathCross is a curated discovery platform for local professional events and communities — starting in Honolulu, beginning with financial professionals, and growing from there.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-navy-100 p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-50 font-bold text-teal-700">{s.n}</span>
            <h2 className="mt-4 font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-navy-500">{s.body}</p>
          </div>
        ))}
      </div>
      <Link href="/events" className="mt-12 inline-block rounded-full bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700">Browse events</Link>
    </div>
  );
}
