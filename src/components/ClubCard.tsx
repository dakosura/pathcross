import Link from "next/link";
import type { Club } from "@/types";
import { interestById } from "@/lib/interests";
import { InterestIcon } from "./InterestIcon";
import { SaveButton } from "./SaveButton";

export function ClubCard({ club }: { club: Club }) {
  const interest = interestById(club.interest)!;
  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-card p-5 shadow-[0_1px_3px_rgba(42,36,25,0.06)] transition duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-[0_14px_34px_rgba(42,36,25,0.12)]">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${interest.tile}`}><InterestIcon id={club.interest} /></span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-snug text-ink">
            <Link href={`/clubs/${club.interest}/${club.id}`} className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-clay-700">{club.name}</Link>
          </h3>
          <p className="mt-0.5 text-sm text-bark">{interest.short} · {club.area}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm text-bark">{club.blurb}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <SaveButton kind="clubs" id={club.id} />
        {club.pending ? (
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-bark">Details coming</span>
        ) : club.pricing?.length ? (
          <span className="text-sm font-semibold text-ink">{club.pricing[0].amount}</span>
        ) : club.url ? (
          <a href={club.url} target="_blank" rel="noopener noreferrer" className="relative z-10 text-sm font-semibold text-clay-700 underline-offset-4 hover:underline">
            Visit site <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
