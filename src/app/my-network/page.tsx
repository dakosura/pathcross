import type { Metadata } from "next";
import { NetworkMap } from "@/components/NetworkMap";
import { getClubs } from "@/lib/clubs-all";
import { getEvents, getRecentEvents, getToday } from "@/lib/data";

export const metadata: Metadata = {
  title: "My Network",
  description: "Build a personal map of the clubs you belong to and the events you're attending on Oʻahu.",
};

export default async function MyNetworkPage() {
  const [events, past, today, clubs] = await Promise.all([getEvents(), getRecentEvents(), getToday(), getClubs()]);
  return <NetworkMap events={events} past={past} today={today} clubs={clubs} />;
}
