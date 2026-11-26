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
      <p>{site.name} stores a few small items in your browser to keep you signed in and remember your choices. We don&apos;t use advertising cookies. Third-party analytics is optional and stays off unless you accept it.</p>

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

      <h2>Visit counts</h2>
      <p>We count page views with our own simple counter. It sets no cookies and stores nothing in your browser, and it keeps no IP address: each visit gets a one-way anonymous code that changes every day. It does nothing if your browser sends a Do Not Track or Global Privacy Control signal. The <Link href="/privacy">privacy notice</Link> lists what it records.</p>

      <h2>Optional analytics</h2>
      <p>We use Google Analytics to understand which pages are useful. It loads only if you chose &quot;Accept all&quot;. If you chose &quot;Essential only&quot;, it doesn&apos;t load for you, and it never loads if your browser sends a Do Not Track or Global Privacy Control signal. Google Analytics sets cookies (named like <code>_ga</code>) that record an anonymous visitor ID and your pages visited, and Google processes that data. We turn off Google&apos;s advertising features and ad personalization, and we don&apos;t send it your account details or any private pages. Choosing &quot;Essential only&quot; later stops it from loading again; you can also clear your browser&apos;s cookies for this site.</p>

      <h2>Other services</h2>
      <p>The maps load imagery from Google Maps Platform (home page) and OpenFreeMap. Your browser contacts those services directly, and they may keep their own technical records. See the <Link href="/privacy">privacy notice</Link> for details.</p>

      <h2>Change your choice</h2>
      <p>You can reopen the cookie banner at any time:</p>
      <p><CookieSettingsButton className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700" /></p>
      <p>You can also clear this site&apos;s data in your browser settings. That signs you out and resets your choice.</p>
    </LegalPage>
  );
}
