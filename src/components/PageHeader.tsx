import type { ReactNode } from "react";

/** Dark topographic band used at the top of inner pages. */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="bg-forest bg-topo text-cream">
      <div className="rise mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay-300">{eyebrow}</p>}
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-cream/75">{children}</div>}
      </div>
    </div>
  );
}
