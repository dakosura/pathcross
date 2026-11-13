import type { Metadata } from "next";
import { Suspense } from "react";
import { EventBrowser } from "@/components/EventBrowser";
import { categories, getEvents } from "@/lib/data";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage(props: PageProps<"/events">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Networking events in Honolulu</h1>
      <p className="mt-2 mb-10 text-navy-500">Browse upcoming events and filter by category.</p>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-navy-50" />}>
        <Browser searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Browser({ searchParams }: Pick<PageProps<"/events">, "searchParams">) {
  const { q } = await searchParams;
  const events = await getEvents();
  return <EventBrowser events={events} categories={categories} initialQuery={typeof q === "string" ? q : ""} />;
}
