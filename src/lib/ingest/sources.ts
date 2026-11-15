import type { Event } from "@/types";

export interface IcsSource {
  type: "ics";
  /** Stable id; becomes the event id prefix and the `source` column value. */
  key: string;
  url: string;
  organizer: string;
  category: Event["category"];
}

export interface EventbriteSource {
  type: "eventbrite";
  key: string;
  /** Organization id you are authorized on (needs EVENTBRITE_TOKEN). */
  orgId: string;
  organizer: string;
  category: Event["category"];
}

export type Source = IcsSource | EventbriteSource;

/**
 * Add a feed here to start importing it. Only add sources whose owners publish
 * the feed for public use (Meetup/Luma calendar feeds) or who have authorized you.
 */
export const sources: Source[] = [
  { type: "ics", key: "meetup-honolulu-tech-network", url: "https://www.meetup.com/honolulu-tech-network/events/ical/", organizer: "Honolulu Tech Network", category: "Tech" },
  { type: "ics", key: "meetup-code-with-aloha", url: "https://www.meetup.com/code-with-aloha/events/ical/", organizer: "Code with Aloha", category: "Tech" },
  { type: "ics", key: "meetup-honolulu-startups", url: "https://www.meetup.com/honolulu-technology-startups-meetup-group/events/ical/", organizer: "Honolulu Technology Startups Meetup", category: "Startup" },
  // { type: "eventbrite", key: "eb-example-org", orgId: "123456789", organizer: "Example Org", category: "General Professional" },
];
