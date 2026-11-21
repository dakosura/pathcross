import type { Metadata } from "next";
import Link from "next/link";
import { ClubCard } from "@/components/ClubCard";
import { InterestIcon } from "@/components/InterestIcon";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeading } from "@/components/SectionHeading";
import { clubs, clubsByInterest } from "@/lib/clubs";
import { interests } from "@/lib/interests";

export const metadata: Metadata = {
  title: "Clubs & Programs",
  description: "Oʻahu clubs, gyms, golf, member and boating clubs by interest, with publicly posted membership information.",
};

export default function ClubsPage() {
  const listed = clubs.filter((c) => !c.pending);
  return (
    <>
      <PageHeader eyebrow="Oʻahu · By interest" title="Clubs & Programs">
        Find the places and groups worth joining, from professional, investing and real estate groups to food and drink, sports, gyms, golf, member clubs, yacht clubs and volunteering. We show only what each organization publishes, with its latest posted pricing when available.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading title="Browse by interest" subtitle="Pick a category to see who's listed." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((i) => {
            const count = clubsByInterest(i.id).length;
            return (
              <Link key={i.id} href={`/clubs/${i.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-[0_14px_34px_rgba(42,36,25,0.12)]">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${i.tile}`}><InterestIcon id={i.id} className="h-7 w-7" /></span>
                <h3 className="mt-5 text-xl font-semibold text-ink group-hover:text-clay-700">{i.name}</h3>
                <p className="mt-2 text-sm text-bark">{i.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {i.covers.map((c) => <li key={c} className={`rounded-full px-2.5 py-1 text-xs font-medium ${i.badge}`}>{c}</li>)}
                </ul>
                <p className="mt-6 flex items-center justify-between text-sm font-semibold text-forest">
                  <span>{count ? `${count} listed` : "Coming soon"}</span>
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
                </p>
              </Link>
            );
          })}
        </div>

        {listed.length > 0 && (
          <div className="mt-16">
            <SectionHeading title="Recently listed" subtitle="Add any of these to your map in My Network." href="/my-network" cta="Open My Network" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listed.slice(0, 6).map((c) => <ClubCard key={c.id} club={c} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
