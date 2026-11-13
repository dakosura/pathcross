"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/events", label: "Events" },
  { href: "/top-10", label: "Top 10" },
  { href: "/about", label: "How it works" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-800 text-sm text-white">P</span>
          <span>Path<span className="text-teal-600">Cross</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-navy-700 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-teal-600">{l.label}</Link>
          ))}
          <Link href="/events" className="rounded-full bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
            Find events
          </Link>
        </nav>
        <button
          className="rounded-md p-2 text-navy-800 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-navy-100 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 font-medium text-navy-800">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
