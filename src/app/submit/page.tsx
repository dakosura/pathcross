import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SubmitForm } from "@/components/SubmitForm";
import { site } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "List your event, club or network",
  description: "Run a club, network or event in Honolulu? Tell PathCross about it and reach people looking for their next room.",
};

const needs = [
  "What it is and who runs it",
  "Date, time and place (or how often it meets)",
  "A short description and who it's for",
  "A website or sign-up link",
  "An email we can reach you at",
];

export default function SubmitPage() {
  return (
    <>
      <PageHeader eyebrow="For organizers" title="List your event, club or network">
        Run something in Honolulu? Tell us about it and we&apos;ll review it for PathCross, where people search for the events, clubs and groups worth their time.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SubmitForm />
        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-sand p-6">
            <h2 className="text-lg font-semibold">Have this ready</h2>
            <ul className="mt-3 space-y-2 text-sm text-bark">
              {needs.map((n) => <li key={n} className="flex gap-2"><span aria-hidden="true" className="text-moss">✓</span>{n}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6 text-sm text-bark">
            <h2 className="text-lg font-semibold text-ink">What happens next</h2>
            <p className="mt-2">We review each request, check the details against your own website, and may email you with questions. Listings link to your page for sign-ups. PathCross doesn&apos;t sell tickets.</p>
            <p className="mt-3">Questions? See the <Link href="/faq" className="font-semibold text-clay-700 hover:underline">FAQ</Link> or email <a href={`mailto:${site.supportEmail}`} className="font-semibold text-clay-700 hover:underline">{site.supportEmail}</a>.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
