"use client";
import type { Event } from "@/types";
import { useNetwork } from "@/lib/network";
import { hasProfile } from "@/lib/profile";
import { rankEvents } from "@/lib/rating";
import { EventGrid } from "./EventGrid";
import { SectionHeading } from "./SectionHeading";

/** The homepage's featured events: hand-picked until the visitor says what they do, then re-ranked for them. */
export function PersonalFeatured({ pool, fallback }: { pool: Event[]; fallback: Event[] }) {
  const { profile } = useNetwork();
  const personal = hasProfile(profile);
  const events = personal ? rankEvents(pool, profile, 3).map((r) => r.ev) : fallback;
  return (
    <>
      <SectionHeading
        title={personal ? "Picked for you" : "Featured events"}
        subtitle={personal ? "The upcoming events that fit what you do and what you're after." : "Hand-picked gatherings happening soon in Honolulu."}
        href="/events"
      />
      <EventGrid events={events} />
    </>
  );
}
