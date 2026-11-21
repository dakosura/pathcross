import { getEvents } from "@/lib/data";
import { HeroClient } from "./HeroClient";

export async function Hero() {
  const events = await getEvents();
  // Fly to the next featured event that has a map position; fall back to any mapped event.
  const mapped = events.filter((e) => e.lat && e.lng);
  const target = mapped.find((e) => e.featured) ?? mapped[0];
  if (!target) return null;
  // The few events shown as pins once the flight settles: one per spot, featured and soonest first.
  // Repeating events (markets, run clubs) have their own page, so they only fill in when there are few others.
  const oneOff = mapped.filter((e) => !e.recurrence);
  const pool = (oneOff.length >= 5 ? oneOff : mapped).filter((e) => e.id !== target.id);
  const spots = new Set([`${target.lat!.toFixed(3)},${target.lng!.toFixed(3)}`]);
  const picks = [target];
  for (const e of [...pool].sort((a, b) => Number(b.featured) - Number(a.featured) || a.date.localeCompare(b.date))) {
    const spot = `${e.lat!.toFixed(3)},${e.lng!.toFixed(3)}`;
    if (picks.length >= 8 || spots.has(spot)) continue;
    spots.add(spot);
    picks.push(e);
  }
  return <HeroClient events={picks} tourId={target.id} />;
}
