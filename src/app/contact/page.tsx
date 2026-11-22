import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support and contact",
  description: "Get in touch with PathCross: questions, listing requests, corrections and feedback.",
};

const topics = [
  { title: "A question about PathCross", subject: "Question about PathCross", body: "Something unclear, or a feature you'd like to see.", cta: "Ask a question" },
  { title: "List or update an event, club or network", subject: "Listing request", body: "Use the form for a new listing. To change or remove one, email us with its name and what to change.", cta: "Email about a listing" },
  { title: "A mistake or something broken", subject: "Correction or problem", body: "A wrong time, a dead link or a page that isn't working. Tell us what you saw and on which page.", cta: "Report a problem" },
  { title: "Partnerships and press", subject: "Partnership or press", body: "Working together, or writing about PathCross.", cta: "Get in touch" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Support" title="We're here to help">
        The quickest way to reach us is by email. Tell us what you need and, if it&apos;s about a page or a listing, which one.
      </PageHeader>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">Email</p>
          <a href={`mailto:${site.supportEmail}`} className="mt-1 block font-display text-3xl font-semibold text-ink hover:text-clay-700">{site.supportEmail}</a>
          <p className="mt-3 max-w-xl text-bark">One inbox for questions, listing requests, corrections and feedback. We read every message.</p>
        </div>

        <h2 className="mt-12 text-2xl font-semibold">What can we help with?</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {topics.map((t) => (
            <div key={t.title} className="flex flex-col rounded-2xl border border-line bg-card p-5">
              <h3 className="text-lg font-semibold text-ink">{t.title}</h3>
              <p className="mt-1 flex-1 text-sm text-bark">{t.body}</p>
              <a href={`mailto:${site.supportEmail}?subject=${encodeURIComponent(t.subject)}`} className="mt-4 text-sm font-semibold text-clay-700 hover:underline">{t.cta} →</a>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/submit" className="rounded-full bg-clay px-6 py-3 font-semibold text-white hover:bg-clay-700">List your event, club or network</Link>
          <Link href="/faq" className="rounded-full px-6 py-3 font-semibold text-forest ring-1 ring-forest/25 hover:bg-moss-50">Read the FAQ</Link>
        </div>
      </div>
    </>
  );
}
