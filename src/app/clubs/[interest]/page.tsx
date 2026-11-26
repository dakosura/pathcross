import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClubCard } from "@/components/ClubCard";
import { PageHeader } from "@/components/PageHeader";
import { getClubsByInterest } from "@/lib/clubs-all";
import { interests, interestById } from "@/lib/interests";

export function generateStaticParams() {
  return interests.map((i) => ({ interest: i.id }));
}

export async function generateMetadata({ params }: PageProps<"/clubs/[interest]">): Promise<Metadata> {
  const { interest } = await params;
  const i = interestById(interest);
  if (!i) return { title: "Clubs & Programs" };
  return { title: `${i.name} in Honolulu & Oʻahu`, description: `${i.blurb} Compare public membership info, pricing and how to join across Oʻahu.` };
}

// `params` is read inside <Suspense> so navigation to this route stays instant.
export default function InterestPage(props: PageProps<"/clubs/[interest]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-sand" /></div>}>
      <Content params={props.params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/clubs/[interest]">, "params">) {
  const { interest: id } = await params;
  const interest = interestById(id);
  if (!interest) notFound();
  const list = await getClubsByInterest(interest.id);
  const ready = list.filter((c) => !c.pending);
  const pending = list.filter((c) => c.pending);

  return (
    <>
      <PageHeader eyebrow="Clubs & Programs" title={interest.name}>{interest.blurb}</PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Interests">
          <Link href="/clubs" className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-bark hover:bg-line">All interests</Link>
          {interests.map((i) => (
            <Link key={i.id} href={`/clubs/${i.id}`} aria-current={i.id === interest.id ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-medium transition ${i.id === interest.id ? "bg-forest text-cream" : "bg-sand text-bark hover:bg-line"}`}>
              {i.short}
            </Link>
          ))}
        </nav>

        {ready.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ready.map((c) => <ClubCard key={c.id} club={c} />)}
          </div>
        )}

        {pending.length > 0 && (
          <section className={ready.length ? "mt-14" : ""}>
            <h2 className="text-xl font-semibold">On our list</h2>
            <p className="mt-1 mb-5 text-sm text-bark">We&apos;re still gathering public details for these.</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map((c) => <ClubCard key={c.id} club={c} />)}
            </div>
          </section>
        )}

        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-clay-300 bg-card p-10 text-center">
            <h2 className="text-2xl font-semibold">Listings are on the way</h2>
            <p className="mx-auto mt-3 max-w-md text-bark">We&apos;re collecting public information for {interest.name.toLowerCase()} on Oʻahu. Each listing will show:</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {interest.covers.map((c) => <li key={c} className={`rounded-full px-3 py-1.5 text-sm font-medium ${interest.badge}`}>{c}</li>)}
            </ul>
            <Link href="/clubs" className="mt-8 inline-block rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700">Browse other interests</Link>
          </div>
        )}
      </div>
    </>
  );
}
