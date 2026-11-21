"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isIgnored } from "@/lib/ignore-me";

/**
 * Privacy-friendly visit counter. Sends the page path, the site the visitor
 * came from and any utm_* tags to /api/track. It sets no cookies and writes
 * nothing to the browser, and it does nothing for people who send a Do Not
 * Track or Global Privacy Control signal, or on a browser where the site
 * admin has chosen not to be counted (see lib/ignore-me.ts).
 */
let first = true; // the referrer and utm tags belong to the first page of a visit only
let lastPath = "";

const blocked = () => {
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === "1" || n.globalPrivacyControl === true || location.hostname === "localhost" || location.hostname === "127.0.0.1" || isIgnored();
};

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) {
    void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (blocked() || pathname === lastPath) return;
    lastPath = pathname;
    const q = new URLSearchParams(location.search);
    send({
      kind: "view",
      path: pathname,
      ...(first ? { referrer: document.referrer, source: q.get("utm_source"), medium: q.get("utm_medium"), campaign: q.get("utm_campaign") } : {}),
    });
    first = false;
  }, [pathname]);

  // Clicks on links that leave PathCross (sign-up and "visit site" buttons).
  useEffect(() => {
    if (blocked()) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !/^https?:$/.test(a.protocol) || a.hostname === location.hostname) return;
      send({ kind: "outbound", path: location.pathname, target: a.href });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
