import Link from "next/link";

const columns = [
  { title: "Discover", links: [["Events", "/events"], ["Calendar", "/calendar"], ["Top 10", "/top-10"]] },
  { title: "Clubs & Programs", links: [["All interests", "/clubs"], ["Professional groups", "/clubs/professional"], ["Gyms & fitness", "/clubs/fitness"], ["Golf clubs", "/clubs/golf"]] },
  { title: "PathCross", links: [["My Network", "/my-network"], ["How it works", "/about"]] },
];

export function Footer() {
  return (
    <footer className="bg-forest bg-topo text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">Path<span className="text-clay-300">Cross</span></p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">A curated guide to the events, clubs and communities worth showing up for. Starting on Oʻahu.</p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay-300">{c.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-cream/80 hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-cream/55 sm:px-6">
          © PathCross · Honolulu, HI · Listings link to each organizer&apos;s own page. Details can change, so confirm with the organizer.
        </p>
      </div>
    </footer>
  );
}
