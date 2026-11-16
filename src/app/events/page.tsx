import type { Metadata } from "next";
import { Suspense } from "react";
import { EventBrowser } from "@/components/EventBrowser";
import { PageHeader } from "@/components/PageHeader";
import { categories, getEvents } from "@/lib/data";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage(props: PageProps<"/events">) {
  return (
    <>
      <PageHeader eyebrow="Oʻahu · Upcoming" title="Networking events in Honolulu">
        Browse what&apos;s coming up, filter by category, and sign up on the organizer&apos;s site.
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
