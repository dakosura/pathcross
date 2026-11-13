import Link from "next/link";

export function SectionHeading({ title, subtitle, href, cta }: { title: string; subtitle?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-bark">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-clay-700 hover:text-clay">
          {cta ?? "View all"} →
        </Link>
      )}
    </div>
  );
}
