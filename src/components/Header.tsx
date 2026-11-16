"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useNetwork } from "@/lib/network";

const links = [
  { href: "/events", label: "Events" },
  { href: "/calendar", label: "Calendar" },
  { href: "/clubs", label: "Clubs & Programs" },
  { href: "/about", label: "How it works" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { saved, user } = useNetwork();
  const count = user ? saved.events.length + saved.clubs.length : 0;
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest text-sm text-cream">P</span>
          <span>Path<span className="text-clay-700">Cross</span></span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 transition ${active(l.href) ? "bg-moss-50 text-forest" : "text-bark hover:bg-sand hover:text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/my-network"
            aria-current={active("/my-network") ? "page" : undefined}
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-cream transition hover:bg-forest-700"
          >
            My Network
            {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-bold text-white">{count}</span>}
          </Link>
        </nav>
        <button className="rounded-md p-2 text-forest lg:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-card px-4 py-3 lg:hidden" aria-label="Mobile">
          {[...links, { href: "/my-network", label: count ? `My Network (${count})` : "My Network" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2.5 font-medium ${active(l.href) ? "bg-moss-50 text-forest" : "text-forest"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
