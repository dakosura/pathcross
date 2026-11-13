import type { Metadata } from "next";
import Link from "next/link";
import { getTopList } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";

export const metadata: Metadata = { title: "Top 10 for Financial Advisors" };

export default async function TopTenPage() {
  const list = (await getTopList("financial-advisors"))!;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Top 10 · {list.audience}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{list.title}</h1>
      <p className="mt-3 text-navy-500">{list.description}</p>
      <ol className="mt-10 space-y-4">
        {list.items.map((ev, i) => (
          <li key={ev.id}>
            <Link href={`/events/${ev.id}`} className="flex items-start gap-4 rounded-2xl border border-navy-100 p-5 hover:border-teal-400 hover:shadow-md">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-800 font-bold text-white">{i + 1}</span>
              <div className="min-w-0">
                <h2 className="font-semibold text-navy-900">{ev.title}</h2>
                <p className="mt-1 text-sm text-navy-500">{formatDate(ev.date)} · {ev.location.venue}</p>
                <div className="mt-2"><CategoryBadge category={ev.category} /></div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
