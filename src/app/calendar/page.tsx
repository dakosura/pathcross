import type { Metadata } from "next";
import { CalendarSwitcher } from "@/components/CalendarSwitcher";
import { PageHeader } from "@/components/PageHeader";
import { categories, getCalendarEvents, getToday } from "@/lib/data";

export const metadata: Metadata = { title: "Honolulu networking events calendar", description: "Month-by-month calendar of networking events, business mixers and meetups in Honolulu and across Oʻahu, rated 1 to 5 stars for meeting people." };

export default async function CalendarPage() {
  const [events, today] = await Promise.all([getCalendarEvents(), getToday()]);
  return (
    <>
      <PageHeader eyebrow="Oʻahu · Month by month" title="Event calendar">
        The Full calendar shows every upcoming event, including weekly run clubs and volunteer shifts. My calendar fills itself from My Network: add an event or a club and it appears there.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CalendarSwitcher events={events} today={today} categories={categories} />
      </div>
    </>
  );
}
