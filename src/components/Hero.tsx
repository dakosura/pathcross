import { getEvents } from "@/lib/data";
import { HeroClient } from "./HeroClient";

export async function Hero() {
  const events = await getEvents();
  return <HeroClient events={events} tourId="chamber-prediction-markets-dec1" />;
}
