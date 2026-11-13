import { getEvents } from "@/lib/data";
import { HeroMap } from "./HeroMap";

export async function Hero() {
  const events = await getEvents();
  return <HeroMap events={events} tourId="waikiki-happy-hour" />;
}
