import { site } from "@/lib/site";

/** A breadcrumb trail for search results. `path` is the page's own path; the last crumb needs none. */
export function breadcrumbs(trail: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      ...(t.path !== undefined ? { item: `${site.url}${t.path}` } : {}),
    })),
  };
}

/** Serialised for a <script type="application/ld+json"> tag, safe against "</script>" in the data. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
