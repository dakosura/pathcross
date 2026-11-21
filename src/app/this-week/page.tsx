import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ProfileSteps } from "@/components/ProfileSteps";
import { ThisWeek } from "@/components/ThisWeek";
import { getCalendarEvents, getToday } from "@/lib/data";
import { addDays } from "@/lib/recurring";

export const metadata: Metadata = {
  title: "This week for you",
  description: "The networking events most worth your time this week in Honolulu, plus one weekly club or activity, picked for what you do.",
};

export default async function ThisWeekPage() {
  const [all, today] = await Promise.all([getCalendarEvents(), getToday()]);
  // This week plus next, in case little is left of this one.
  const events = all.filter((e) => e.date <= addDays(today, 14));
  return (
    <>
      <PageHeader eyebrow="For you · This week" title="Your week, planned">
        The few events most worth your time this week, plus one weekly club or activity to make a habit. Add them to your calendar, or tap I&apos;m going and they&apos;re saved to My Network.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ThisWeek events={events} today={today} />
        <aside id="you" className="h-fit scroll-mt-24 rounded-2xl border border-line bg-sand p-6 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">About you</p>
          <h2 className="mt-1 mb-4 text-xl font-semibold">Make this week yours</h2>
          <ProfileSteps />
        </aside>
      </div>
    </>
  );
}
