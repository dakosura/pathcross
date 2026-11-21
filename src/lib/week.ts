import type { Event } from "@/types";
import type { Profile } from "./profile";
import { rankEvents } from "./rating";
import { addDays, weekdayOf } from "./recurring";

type Ranked = ReturnType<typeof rankEvents>[number];

/**
 * "This Week for You": the best few one-off events in the Monday-to-Sunday week
 * that today falls in, plus one repeating club or activity to make a habit of.
 * When too little is left of the week, the best of next week fills in (marked `later`).
 */
export function weekPlan(events: Event[], today: string, profile: Profile, picks = 5) {
  const weekEnd = addDays(today, (7 - weekdayOf(today)) % 7);
  const nextEnd = addDays(weekEnd, 7);
  const upcoming = events.filter((e) => e.date >= today);
  const oneOffs = (from: string, to: string) => upcoming.filter((e) => !e.series_id && e.date >= from && e.date <= to);

  const thisWeek: (Ranked & { later: boolean })[] = rankEvents(oneOffs(today, weekEnd), profile, picks).map((r) => ({ ...r, later: false }));
  let chosen = thisWeek;
  if (thisWeek.length < 3) {
    const next = rankEvents(oneOffs(addDays(weekEnd, 1), nextEnd), profile, 3 - thisWeek.length).map((r) => ({ ...r, later: true }));
    chosen = [...thisWeek, ...next];
  }
  chosen.sort((a, b) => a.ev.date.localeCompare(b.ev.date) || a.ev.start_time.localeCompare(b.ev.start_time));

  const routine = rankEvents(upcoming.filter((e) => e.series_id && e.date <= weekEnd), profile, 1)[0];
  return { picks: chosen, routine, weekEnd };
}
