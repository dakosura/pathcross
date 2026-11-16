import type { Metadata } from "next";
import { NetworkMap } from "@/components/NetworkMap";
import { clubs } from "@/lib/clubs";
import { getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "My Network",
  description: "Build a personal map of the clubs you belong to and the events you're attending on Oʻahu.",
};

export default async function MyNetworkPage() {
  const events = await getEvents();
  return <NetworkMap events={events} clubs={clubs} />;
}
