import Link from "next/link";
import { CookieSettingsButton } from "./CookieConsent";
import { site } from "@/lib/site";

const icons: Record<(typeof site.social)[number]["id"], { fill?: boolean; paths: string[] }> = {
  facebook: { fill: true, paths: ["M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.2 15.8 2 14.7 2 12.4 2 10.8 3.4 10.8 6v2.5H8.2v3.3h2.6V22H14V11.8h2.6l.4-3.3H14z"] },
  instagram: { paths: ["M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3z", "M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4z", "M17.4 6.6h.01"] },
  x: { fill: true, paths: ["M17.8 3h2.9l-6.3 7.2L22 21h-5.8l-4.5-5.9L6.5 21H3.6l6.7-7.7L3 3h5.9l4.1 5.4L17.8 3zm-1 16.3h1.6L7.2 4.6H5.5l11.3 14.7z"] },
};

const columns = [
  { title: "Discover", links: [["Events", "/events"], ["Calendar", "/calendar"], ["Weekly lineup", "/weekly"], ["Top 10 for you", "/top-10"]] },
  { title: "Clubs & Programs", links: [["All interests", "/clubs"], ["Professional groups", "/clubs/professional"], ["Real estate", "/clubs/realestate"], ["Food & drink", "/clubs/food"], ["Sports", "/clubs/sports"], ["Gyms & fitness", "/clubs/fitness"], ["Golf clubs", "/clubs/golf"], ["Volunteering", "/clubs/volunteer"]] },
  { title: "PathCross", links: [["My Network", "/my-network"], ["How it works", "/about"]] },
];

export function Footer() {
  return (
    <footer className="bg-forest bg-topo text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">Path<span className="text-clay-300">Cross</span></p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">Your one-stop shop for networking events, clubs and groups in Honolulu, matched to what you do.</p>
          <ul className="mt-5 flex gap-3" aria-label="PathCross on social media">
            {site.social.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer me" aria-label={`PathCross on ${s.name} (${s.handle})`} title={`${s.name}: ${s.handle}`} className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 text-cream transition hover:bg-clay hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={icons[s.id].fill ? "currentColor" : "none"} stroke={icons[s.id].fill ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {icons[s.id].paths.map((d) => <path key={d} d={d} />)}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-cream/60 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© PathCross · Honolulu, HI · Listings link to each organizer&apos;s own page. Confirm details with the organizer.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
            <CookieSettingsButton className="hover:text-white" />
          </nav>
        </div>
      </div>
    </footer>
  );
}
