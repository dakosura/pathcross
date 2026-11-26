import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TopTen } from "@/components/TopTen";
import { getEvents } from "@/lib/data";
import { jsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Top 10 networking events on Oʻahu, ranked for you",
  description: "The ten best upcoming events in Honolulu for meeting people, each rated 1 to 5 stars. Tell PathCross what you do and the list re-ranks for you.",
};

export default async function TopTenPage() {
  const events = await getEvents();
  // The default ranking (soonest first, featured events lead) as a list Google can read.
  const top = [...events].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 10);
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top networking events in Honolulu",
    itemListElement: top.map((e, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/events/${e.id}`, name: e.title })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(list) }} />
      <PageHeader eyebrow="For you" title="The ten events most worth your time">
        Every upcoming event gets a networking rating from 1 to 5 stars. Tell us what you do and what you&apos;re after, and we rank them for you.
      </PageHeader>
      <TopTen events={events} />
    </>
  );
}
