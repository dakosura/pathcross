import Link from "next/link";

export function SectionHeading({ title, subtitle, href, cta }: { title: string; subtitle?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-navy-500">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-teal-600 hover:text-teal-700">
          {cta ?? "View all"} →
        </Link>
      )}
    </div>
  );
}
