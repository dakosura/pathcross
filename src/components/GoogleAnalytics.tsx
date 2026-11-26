"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useConsent } from "@/lib/consent";
import { isIgnored } from "@/lib/ignore-me";

const GA_ID = "G-YW5J824DEP";

/** Private pages are never sent to Google. */
const PRIVATE = [/^\/ops(\/|$)/, /^\/my-network(\/|$)/];

/**
 * Google Analytics. Loads only for visitors who chose "Accept all", never on private pages,
 * never on localhost, never when the browser sends Do Not Track / Global Privacy Control,
 * and never on a browser where the admin has switched on "don't count my visits".
 */
export function GoogleAnalytics() {
  const consent = useConsent();
  const pathname = usePathname();
  if (consent !== "all") return null;
  if (PRIVATE.some((p) => p.test(pathname))) return null;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (n.doNotTrack === "1" || n.globalPrivacyControl === true || location.hostname === "localhost" || location.hostname === "127.0.0.1" || isIgnored()) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });
      `}</Script>
    </>
  );
}
