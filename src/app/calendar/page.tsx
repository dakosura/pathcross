import type { Metadata } from "next";
import { CalendarView } from "@/components/CalendarView";
import { PageHeader } from "@/components/PageHeader";
import { categories, getEvents, getToday } from "@/lib/data";

export const metadata: Metadata = { title: "Calendar", description: "Every upcoming PathCross event on Oʻahu, month by month." };

export default async function CalendarPage() {
  const [events, today] = await Promise.all([getEvents(), getToday()]);
  return (
    <>
      <PageHeader eyebrow="Oʻahu · Month by month" title="Event calendar">
        Every upcoming event in one view. Pick a day to see what&apos;s on and where to sign up.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CalendarView events={events} today={today} categories={categories} />
      </div>
    </>
  );
}
