import type { Metadata } from "next";
import { Suspense } from "react";
import { EventBrowser } from "@/components/EventBrowser";
import { PageHeader } from "@/components/PageHeader";
import { categories, getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Networking events in Honolulu and across Oʻahu",
  description: "Upcoming networking events, mixers, meetups and business gatherings in Honolulu, Hawaiʻi. Each one is rated 1 to 5 stars for meeting people, with price and sign-up link.",
};

export default function EventsPage(props: PageProps<"/events">) {
  return (
    <>
      <PageHeader eyebrow="Oʻahu · Upcoming" title="Networking events in Honolulu">
        Browse what&apos;s coming up, see how each event rates for meeting people, and sign up on the organizer&apos;s site.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-sand" />}>
        <Browser searchParams={props.searchParams} />
      </Suspense>
      </div>
    </>
  );
}

async function Browser({ searchParams }: Pick<PageProps<"/events">, "searchParams">) {
  const { q } = await searchParams;
  const events = await getEvents();
  return <EventBrowser events={events} categories={categories} initialQuery={typeof q === "string" ? q : ""} />;
}
