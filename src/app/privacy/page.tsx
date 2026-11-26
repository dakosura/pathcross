import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice", description: "What PathCross collects, why, and the choices you have." };

export default function PrivacyPage() {
  const mail = <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>;
  return (
    <LegalPage title="Privacy notice" current="/privacy" intro="What we collect, why we collect it, and the choices you have. We keep it to the minimum the site needs.">
      <h2>Who we are</h2>
      <p>{site.name} is a guide to events, clubs and programs, based in {site.location}. This notice covers {site.url.replace("https://", "")}. You can reach us at {mail}.</p>

      <h2>What we collect</h2>
      <p>You can browse events, the calendar and Clubs &amp; Programs without giving us anything. We collect information only in these cases:</p>
      <ul>
        <li><strong>Your email address</strong>, when you create a login for My Network. We use it to send you sign-in links, and we may email you about your account or PathCross. Our site owner can see the list of account emails.</li>
        <li><strong>Your My Network picks</strong>: the events and clubs you add. They are stored with your account so your map is available on any device. If you mark an event as one you&apos;re going to or attended, we store that too.</li>
        <li><strong>Your private event notes and rating answers</strong>: if you jot who you met at an event, that note is stored with your account and only you can read it through the site. If you say whether an event&apos;s networking rating was accurate, we keep your answer to improve future ratings.</li>
        <li><strong>Listing requests</strong>: if you send us a club, event or network through the List your event form, we store what you enter, including your name and email address (and phone number, if you give one), so we can review the listing and contact you. Only the site owner sees it. We delete it if you ask.</li>
        <li><strong>Your profession and what you&apos;re looking for</strong>, if you choose to tell us. They are optional and used only to rate and rank events for you. They are kept in your browser, and with your account once you create one.</li>
        <li><strong>Sign-in details</strong>: the dates you created your account and last signed in, kept by our sign-in provider.</li>
        <li><strong>Anonymous visit counts</strong>: when you view a page, we record the page, the site you came from, any campaign tag in the link, your country, your device type and browser, and a one-way anonymous code that changes every day. We don&apos;t store your IP address or any cookie, and the code can&apos;t be traced back to you or linked from one day to the next. We also count clicks on links that leave {site.name}, such as a Sign up button. This is switched off if your browser sends a Do Not Track or Global Privacy Control signal.</li>
        <li><strong>Technical data</strong>: like most sites, our hosting provider logs requests, including IP address, browser type and the pages requested. We use this to run and protect the site.</li>
      </ul>
      <p>We don&apos;t collect payment details. We don&apos;t ask for your name, phone number or precise location.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To sign you in and keep you signed in.</li>
        <li>To save and show your network.</li>
        <li>To tailor event ratings and your Top 10 to you.</li>
        <li>To understand which pages and events are useful, so we can improve the site.</li>
        <li>To keep the site working and secure.</li>
      </ul>
      <p>We don&apos;t sell your information, and we don&apos;t use it for advertising. Beyond the anonymous visit counts above, we use Google Analytics, which runs only if you choose &quot;Accept all&quot; in the cookie banner, as described in the <Link href="/cookies">cookie policy</Link>. It records pages viewed, approximate location, device and browser using cookies, and Google processes that data. We turn off its advertising features.</p>

      <h2>Who helps us run the site</h2>
      <p>These providers process data for us, or receive requests from your browser when you use the site:</p>
      <table>
        <thead><tr><th>Provider</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>Stores accounts, My Network picks and the anonymous visit counts, and sends sign-in emails.</td></tr>
          <tr><td>Vercel</td><td>Hosts the website and keeps request logs.</td></tr>
          <tr><td>Google Maps Platform</td><td>Supplies the 3D map on the home page. Your browser requests map imagery from Google directly.</td></tr>
          <tr><td>OpenFreeMap</td><td>Supplies street-map tiles for the other maps. Your browser requests them directly.</td></tr>
        </tbody>
      </table>
      <p>When you follow a &quot;Sign up&quot; or &quot;Visit site&quot; link, you leave {site.name}. The organizer&apos;s own privacy policy applies there.</p>

      <h2>How long we keep it</h2>
      <p>We keep your email, picks and profile answers for as long as you have an account. If you ask us to delete your account, we delete both. Hosting logs are kept by our provider for a limited time.</p>

      <h2>Your choices</h2>
      <ul>
        <li><strong>See or correct your data</strong>: your picks are visible in My Network, where you can remove any of them. Your profession and goals can be changed or cleared on the Top 10 page.</li>
        <li><strong>Delete your account</strong>: email {mail} from the address you signed up with and we&apos;ll delete your account and picks.</li>
        <li><strong>Ask a question or object</strong>: email us and we&apos;ll respond. Depending on where you live, you may have further rights under local law, and we&apos;ll honor them.</li>
      </ul>

      <h2>Children</h2>
      <p>{site.name} is meant for adults. We don&apos;t knowingly collect information from children under 13. If you believe a child has created an account, email us and we&apos;ll remove it.</p>

      <h2>Changes</h2>
      <p>If we change this notice, we&apos;ll update the date at the top of this page. For significant changes, we&apos;ll also tell account holders by email.</p>
    </LegalPage>
  );
}
