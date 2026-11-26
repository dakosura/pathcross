"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Event, EventCategory } from "@/types";
import { downloadIcs, icsFileMany } from "@/lib/calendar-links";
import { useNetwork } from "@/lib/network";
import { CalendarView } from "./CalendarView";
import { SignInForm } from "./SignInForm";

type View = "all" | "mine";

/**
 * Two calendars in one page: the Full calendar of everything on PathCross, and My Calendar,
 * which fills itself from My Network: events added directly, plus every event hosted by a club
 * that was added. Open it directly with /calendar#mine.
 */
export function CalendarSwitcher({ events, today, categories, clubNames }: { events: Event[]; today: string; categories: readonly EventCategory[]; clubNames: Record<string, string> }) {
  const [view, setView] = useState<View>("all");
  const { saved, user, status } = useNetwork();

  useEffect(() => {
    const t = setTimeout(() => { if (window.location.hash === "#mine") setView("mine"); }, 0);
    return () => clearTimeout(t);
  }, []);

  const choose = (v: View) => {
    setView(v);
    try { window.history.replaceState(null, "", v === "mine" ? "#mine" : window.location.pathname); } catch { /* ignore */ }
  };

  // Repeating events are saved under their series id, and every date of the series belongs to My Calendar.
  const mine = useMemo(() => {
    const list: Event[] = [];
    const labels: Record<string, string | null> = {};
    for (const e of events) {
      const direct = saved.events.includes(e.id) || (e.series_id !== undefined && saved.events.includes(e.series_id));
      const viaClub = !direct && e.club_id !== undefined && saved.clubs.includes(e.club_id);
      if (!direct && !viaClub) continue;
      list.push(e);
      labels[e.id] = viaClub ? (e.club_id && clubNames[e.club_id]) || null : null;
    }
    return { list, labels };
  }, [events, saved, clubNames]);

  const upcomingMine = mine.list.filter((e) => e.date >= today);

  const tab = (v: View, label: string, count?: number) => (
    <button type="button" role="tab" aria-selected={view === v} onClick={() => choose(v)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${view === v ? "bg-card text-forest shadow-sm" : "text-bark hover:text-ink"}`}>
      {label}{count !== undefined && count > 0 && <span className="ml-2 rounded-full bg-clay px-1.5 py-0.5 text-[11px] font-bold text-white">{count}</span>}
    </button>
  );

  return (
    <div>
      <div className="mb-6 inline-flex gap-1 rounded-full bg-sand p-1" role="tablist" aria-label="Which calendar">
        {tab("all", "Full calendar")}
        {tab("mine", "My calendar", user ? upcomingMine.length : undefined)}
      </div>

      {view === "all" ? (
        <CalendarView key="all" events={events} today={today} categories={categories} />
      ) : status === "loading" ? (
        <div className="h-72 animate-pulse rounded-2xl bg-sand" aria-label="Loading your calendar" />
      ) : !user ? (
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Sign in to see your calendar</h2>
          <p className="mb-4 mt-2 text-sm text-bark">Add any event or club to My Network and it lands here on its own. No password needed.</p>
          <SignInForm />
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-3 text-sm text-bark">
            <p className="max-w-2xl">
              {upcomingMine.length === 0
                ? <>Nothing here yet. Tap <strong>Add to My Network</strong> on any event or club and it shows up on this calendar automatically. Events from clubs you add appear too.</>
                : <>Everything in My Network, in one place: events you added, plus events from the clubs you added.</>}
            </p>
            {upcomingMine.length > 0 && (
              <button type="button" onClick={() => downloadIcs("my-pathcross-calendar.ics", icsFileMany(upcomingMine))} className="shrink-0 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream hover:bg-forest-700">
                Add all to my phone calendar (.ics)
              </button>
            )}
          </div>
          {upcomingMine.length === 0 && (
            <p className="mb-6 flex flex-wrap gap-4 text-sm font-semibold text-clay-700">
              <Link href="/events" className="hover:underline">Browse events →</Link>
              <Link href="/clubs" className="hover:underline">Browse clubs →</Link>
              <button type="button" onClick={() => choose("all")} className="hover:underline">Open the full calendar →</button>
            </p>
          )}
          <CalendarView key="mine" events={mine.list} today={today} categories={categories} mineLabels={mine.labels} />
        </>
      )}
    </div>
  );
}
