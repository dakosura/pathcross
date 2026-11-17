import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { InterestIcon } from "@/components/InterestIcon";
import { SaveButton } from "@/components/SaveButton";
import { clubs, clubById } from "@/lib/clubs";
import { getEvents } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { interestById } from "@/lib/interests";
import { hostLabel } from "@/lib/links";

export function generateStaticParams() {
  return clubs.map((c) => ({ interest: c.interest, id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/clubs/[interest]/[id]">): Promise<Metadata> {
  const { id } = await params;
  const club = clubById(id);
  return { title: club?.name ?? "Club", description: club?.blurb };
}

// `params` is read inside <Suspense> so navigation to this route stays instant.
export default function ClubPage(props: PageProps<"/clubs/[interest]/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><div className="h-72 animate-pulse rounded-2xl bg-sand" /></div>}>
      <Content params={props.params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/clubs/[interest]/[id]">, "params">) {
  const { interest: interestId, id } = await params;
  const club = clubById(id);
  if (!club || club.interest !== interestId) notFound();
  const interest = interestById(club.interest)!;
  const events = (await getEvents()).filter((e) => e.club_id === club.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href={`/clubs/${interest.id}`} className="text-sm font-medium text-clay-700 hover:text-clay">← {interest.name}</Link>
      <div className="mt-6 flex items-start gap-5">
        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${interest.tile}`}><InterestIcon id={club.interest} className="h-8 w-8" /></span>
        <div>
          <p className="text-sm font-semibold text-bark">{interest.short} · {club.area}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{club.name}</h1>
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <section>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-3 leading-relaxed text-bark">{club.blurb}</p>
            {club.pending && <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm text-bark">We&apos;re still gathering public details for this listing.</p>}
          </section>

          {club.facilities?.length ? (
            <section>
              <h2 className="text-lg font-semibold">What&apos;s there</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {club.facilities.map((f) => <li key={f} className={`rounded-full px-3 py-1.5 text-sm font-medium ${interest.badge}`}>{f}</li>)}
              </ul>
            </section>
          ) : null}

          {club.membership && (
            <section>
              <h2 className="text-lg font-semibold">How to join</h2>
              <p className="mt-3 leading-relaxed text-bark">{club.membership}</p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold">Public pricing</h2>
            {club.pricing?.length ? (
              <>
                <dl className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
                  {club.pricing.map((p) => (
                    <div key={p.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                      <dt className="text-sm text-bark">{p.label}{p.note && <span className="block text-xs text-bark/70">{p.note}</span>}</dt>
                      <dd className="font-semibold text-ink">{p.amount}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-bark/80">
                  {club.pricing_as_of && <>Checked {formatDate(club.pricing_as_of, { year: "numeric" })}. </>}
                  {club.pricing_source && <a href={club.pricing_source} target="_blank" rel="noopener noreferrer" className="font-semibold text-clay-700 hover:underline">Source ↗</a>}
                  {" "}Prices change, so confirm with the organization.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-bark">No public pricing is listed yet.{club.url ? " Check the organization's site for current rates." : ""}</p>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-sand p-6 text-sm">
          <dl className="space-y-4">
            <div><dt className="font-semibold text-ink">Where</dt><dd className="text-bark">{club.address ?? club.area}</dd></div>
            {club.phone && <div><dt className="font-semibold text-ink">Phone</dt><dd className="text-bark"><a href={`tel:${club.phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">{club.phone}</a></dd></div>}
            <div><dt className="font-semibold text-ink">Category</dt><dd className="text-bark">{interest.name}</dd></div>
          </dl>
          {club.url && (
            <a href={club.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-clay px-4 py-3 text-center font-semibold text-white hover:bg-clay-700">
              Visit {hostLabel(club.url)} <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          <SaveButton kind="clubs" id={club.id} size="lg" />
        </aside>
      </div>

      {events.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-semibold">Upcoming events</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
