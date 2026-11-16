import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieConsent";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Cookie policy", description: "What PathCross stores in your browser, and how to change your choice." };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy" current="/cookies" intro="What the site stores in your browser, what's optional, and how to change your mind.">
      <h2>The short version</h2>
      <p>{site.name} stores a few small items in your browser to keep you signed in and remember your choices. We don&apos;t use advertising cookies. Analytics is optional and stays off unless you accept it.</p>

      <h2>Essential storage</h2>
      <p>These are needed for the site to work, so they don&apos;t require consent. They are kept in your browser&apos;s local storage rather than as traditional cookies.</p>
      <table>
        <thead><tr><th>Item</th><th>Purpose</th><th>Kept until</th></tr></thead>
        <tbody>
          <tr><td><code>sb-…-auth-token</code></td><td>Keeps you signed in to My Network.</td><td>You sign out.</td></tr>
          <tr><td><code>pathcross.network.pending</code></td><td>Remembers the item you clicked &quot;Add to My Network&quot; on while you sign in.</td><td>You sign in.</td></tr>
          <tr><td><code>pathcross.consent.v1</code></td><td>Remembers your cookie choice so we don&apos;t ask again.</td><td>You change it or clear your browser data.</td></tr>
        </tbody>
      </table>

      <h2>Optional analytics</h2>
      <p>We don&apos;t run analytics at the moment. If we add it, it will help us understand which pages are useful, and it will load only for people who chose &quot;Accept all&quot;. If you chose &quot;Essential only&quot;, it won&apos;t load for you.</p>

      <h2>Other services</h2>
      <p>The maps load imagery from Google Maps Platform (home page) and OpenFreeMap. Your browser contacts those services directly, and they may keep their own technical records. See the <Link href="/privacy">privacy notice</Link> for details.</p>

      <h2>Change your choice</h2>
      <p>You can reopen the cookie banner at any time:</p>
      <p><CookieSettingsButton className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700" /></p>
      <p>You can also clear this site&apos;s data in your browser settings. That signs you out and resets your choice.</p>
    </LegalPage>
  );
}
