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

export interface MicrodataSource {
  type: "microdata";
  key: string;
  /** Month calendar of a GrowthZone / ChamberMaster site (see microdata.ts). */
  calendarUrl: string;
  organizer: string;
  category: Event["category"];
}

export type Source = IcsSource | EventbriteSource | MicrodataSource;

/**
 * Add a feed here to start importing it. Three kinds are supported:
 *  - "ics": a public calendar feed (Meetup groups, Luma calendars, Google Calendar).
 *  - "microdata": an organization's own event calendar that marks up each event
 *    page with schema.org data (GrowthZone / ChamberMaster sites).
 *  - "eventbrite": an Eventbrite organization that has authorized you.
 * Only add sources whose owners publish events for the public, and check the
 * site's robots.txt allows the calendar pages before adding one.
 */
export const sources: Source[] = [
  { type: "ics", key: "meetup-honolulu-tech-network", url: "https://www.meetup.com/honolulu-tech-network/events/ical/", organizer: "Honolulu Tech Network", category: "Tech" },
  { type: "ics", key: "meetup-code-with-aloha", url: "https://www.meetup.com/code-with-aloha/events/ical/", organizer: "Code with Aloha", category: "Tech" },
  { type: "ics", key: "meetup-honolulu-startups", url: "https://www.meetup.com/honolulu-technology-startups-meetup-group/events/ical/", organizer: "Honolulu Technology Startups Meetup", category: "Startup" },
  { type: "microdata", key: "chamber-hawaii", calendarUrl: "https://business.cochawaii.org/events/calendar", organizer: "Chamber of Commerce Hawaii", category: "General Professional" },
  // { type: "eventbrite", key: "eb-example-org", orgId: "123456789", organizer: "Example Org", category: "General Professional" },
];
