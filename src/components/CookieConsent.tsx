"use client";
import Link from "next/link";
import { reopenConsent, setConsent, useConsent } from "@/lib/consent";

/** Bottom banner shown until the visitor makes a choice. Both choices are equally easy to pick. */
export function CookieBanner() {
  const consent = useConsent();
  if (consent !== "undecided") return null;
  return (
    <div role="region" aria-label="Cookie choices" className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5">
      <div className="rise mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-[0_18px_50px_rgba(42,36,25,0.25)] sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm text-bark">
          <span className="font-semibold text-ink">Your privacy choices. </span>
          We store what&apos;s needed to keep you signed in. Optional analytics stays off unless you accept it. See the{" "}
          <Link href="/cookies" className="font-semibold text-clay-700 underline-offset-4 hover:underline">cookie policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => setConsent("essential")} className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-forest ring-1 ring-forest/30 transition hover:bg-moss-50 sm:flex-none">Essential only</button>
          <button type="button" onClick={() => setConsent("all")} className="flex-1 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-700 sm:flex-none">Accept all</button>
        </div>
      </div>
    </div>
  );
}

/** Reopens the banner. Used in the footer and on the cookie policy page. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return <button type="button" onClick={reopenConsent} className={className}>Cookie settings</button>;
}
