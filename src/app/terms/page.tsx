import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of service", description: "The terms that apply when you use PathCross." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" current="/terms" intro="The ground rules for using PathCross. By using the site, you agree to them.">
      <h2>What PathCross is</h2>
      <p>{site.name} is an informational guide to events, clubs and programs. We don&apos;t organize the events or run the clubs we list, and we don&apos;t sell tickets or memberships. Sign-up always happens on the organizer&apos;s own site.</p>

      <h2>Listings and accuracy</h2>
      <p>Listings come from organizers&apos; public pages and calendar feeds. Dates, venues, prices and membership details can change or be cancelled without notice.</p>
      <ul>
        <li>Always confirm details with the organizer before you go or pay.</li>
        <li>Prices shown are the latest publicly posted figures we found, with the date we checked them where we have it.</li>
        <li>A listing isn&apos;t an endorsement, and we aren&apos;t affiliated with the organizations listed unless we say so.</li>
      </ul>
      <p>If you run a listed organization and want something corrected or removed, email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>

      <h2>Your account</h2>
      <ul>
        <li>Browsing needs no account. My Network needs a login created with your email.</li>
        <li>Use an email address you control, and keep access to it secure. Anyone who can open your sign-in emails can open your account.</li>
        <li>You can ask us to delete your account at any time.</li>
        <li>We may suspend or remove an account that is used to break these terms.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Please don&apos;t:</p>
      <ul>
        <li>Try to break, overload or gain unauthorized access to the site or its data.</li>
        <li>Scrape or copy the site&apos;s content in bulk for republication.</li>
        <li>Use the site for anything unlawful, or to harass or mislead others.</li>
      </ul>

      <h2>Content and links</h2>
      <p>The {site.name} name, design and original text belong to us. Organization names, logos and event details belong to their owners. Links to other sites are provided for convenience, and we aren&apos;t responsible for their content or practices.</p>

      <h2>No warranty</h2>
      <p>The site is provided &quot;as is&quot; and &quot;as available&quot;. We work to keep listings accurate, but we don&apos;t guarantee that the site will be error-free, uninterrupted or complete.</p>

      <h2>Limit of liability</h2>
      <p>To the extent the law allows, {site.name} isn&apos;t liable for losses that result from relying on a listing, attending an event, joining a club, or dealing with an organizer or other third party. Nothing in these terms limits liability that can&apos;t be limited by law.</p>

      <h2>Changes to the site and these terms</h2>
      <p>We may change or stop any part of the site. If we change these terms, we&apos;ll update the date at the top of this page. Continuing to use the site after a change means you accept the new terms.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of Hawaiʻi, United States.</p>

      <h2>Related policies</h2>
      <p>See the <Link href="/privacy">privacy notice</Link> for how we handle your information and the <Link href="/cookies">cookie policy</Link> for what the site stores in your browser.</p>
    </LegalPage>
  );
}
