import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { site } from "@/lib/site";

const pages = [
  { href: "/privacy", label: "Privacy notice" },
  { href: "/terms", label: "Terms of service" },
  { href: "/cookies", label: "Cookie policy" },
];

/** Shared shell for the legal pages: header, cross-links and readable long-form text. */
export function LegalPage({ title, current, intro, children }: { title: string; current: string; intro: string; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow={`Last updated ${site.policiesUpdated}`} title={title}>{intro}</PageHeader>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Policies" className="mb-10 flex flex-wrap gap-2">
          {pages.map((p) => (
            <Link key={p.href} href={p.href} aria-current={p.href === current ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-medium transition ${p.href === current ? "bg-forest text-cream" : "bg-sand text-bark hover:bg-line"}`}>
              {p.label}
            </Link>
          ))}
        </nav>
        <div className="legal">{children}</div>
        <p className="mt-12 rounded-2xl bg-sand px-5 py-4 text-sm text-bark">
          Questions? Email <a href={`mailto:${site.contactEmail}`} className="font-semibold text-clay-700 hover:underline">{site.contactEmail}</a>.
        </p>
      </div>
    </>
  );
}
