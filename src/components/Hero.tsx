import { getEvents } from "@/lib/data";
import { HeroClient } from "./HeroClient";

export async function Hero() {
  const events = await getEvents();
  // Fly to the next featured event that has a map position; fall back to any mapped event.
  const mapped = events.filter((e) => e.lat && e.lng);
  const target = mapped.find((e) => e.featured) ?? mapped[0];
  if (!target) return null;
  return <HeroClient events={events} tourId={target.id} />;
}
