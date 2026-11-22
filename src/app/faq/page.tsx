import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { faqGroups } from "@/lib/faq";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about using PathCross and about listing your event, club or network in Honolulu.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.items).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader eyebrow="Help" title="Frequently asked questions">
        Quick answers about using PathCross and about getting your own event, club or network listed.
      </PageHeader>
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6">
        {faqGroups.map((g) => (
          <section key={g.title} aria-labelledby={g.title}>
            <h2 id={g.title} className="text-2xl font-semibold">{g.title}</h2>
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {g.items.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sand text-forest transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-bark">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="rounded-2xl bg-sand p-6 text-bark">
          <h2 className="text-xl font-semibold text-ink">Still need help?</h2>
          <p className="mt-2">Email us at <a href={`mailto:${site.supportEmail}`} className="font-semibold text-clay-700 hover:underline">{site.supportEmail}</a>, or have a look at the <Link href="/contact" className="font-semibold text-clay-700 hover:underline">support page</Link>. Ready to list something? <Link href="/submit" className="font-semibold text-clay-700 hover:underline">Send us the details</Link>.</p>
        </div>
      </div>
    </>
  );
}
