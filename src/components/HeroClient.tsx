"use client";
import { useState } from "react";
import type { Event } from "@/types";
import { Hero3D } from "./Hero3D";
import { HeroMap } from "./HeroMap";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/** Photorealistic 3D when a Google Maps key is configured and works; street map otherwise. */
export function HeroClient({ events, tourId }: { events: Event[]; tourId: string }) {
  const [failed, setFailed] = useState(false);
  if (!KEY || failed) return <HeroMap events={events} tourId={tourId} />;
  return <Hero3D events={events} tourId={tourId} apiKey={KEY} onFail={() => setFailed(true)} />;
}
