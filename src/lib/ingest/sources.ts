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
  { type: "ics", key: "meetup-blockchain-in-paradise", url: "https://www.meetup.com/honolulu-crypto-meetup-group/events/ical/", organizer: "Blockchain in Paradise", category: "Finance" },
  { type: "ics", key: "meetup-honolulu-bitcoin", url: "https://www.meetup.com/honolulu-bitcoin/events/ical/", organizer: "Honolulu Bitcoin", category: "Finance" },
  { type: "ics", key: "meetup-hawaii-rei", url: "https://www.meetup.com/hawaii-rei/events/ical/", organizer: "Hawaii Real Estate Investors", category: "Real Estate" },
  { type: "ics", key: "meetup-rei-aloha", url: "https://www.meetup.com/rei808-passive-real-estate-investing-for-the-working-class/events/ical/", organizer: "REI Aloha: Hawaii Passive Accredited Investor Club", category: "Real Estate" },
  { type: "ics", key: "meetup-honolulu-young-professionals", url: "https://www.meetup.com/honolulu-young-professionals-west-coast-hours/events/ical/", organizer: "Honolulu Young Professionals", category: "General Professional" },
  { type: "ics", key: "meetup-oahu-young-professionals", url: "https://www.meetup.com/oahuyp/events/ical/", organizer: "O’ahu Young Professionals", category: "General Professional" },
  { type: "ics", key: "meetup-hawaii-small-business-network", url: "https://www.meetup.com/the-hawaii-small-business-network/events/ical/", organizer: "The Hawaii Small Business Network", category: "General Professional" },
  { type: "ics", key: "meetup-women-of-the-world-network", url: "https://www.meetup.com/women-of-the-world-network/events/ical/", organizer: "Women of the World Network (HI)", category: "General Professional" },
  { type: "ics", key: "meetup-thrivehi", url: "https://www.meetup.com/thrivehi/events/ical/", organizer: "ThriveHI", category: "Tech" },
  { type: "ics", key: "luma-thrivehi", url: "https://api.lu.ma/ics/get?entity=calendar&id=cal-MSOLiOSahcU6BDZ", organizer: "ThriveHI", category: "Tech" },
  { type: "microdata", key: "chamber-hawaii", calendarUrl: "https://business.cochawaii.org/events/calendar", organizer: "Chamber of Commerce Hawaii", category: "General Professional" },
  // { type: "eventbrite", key: "eb-example-org", orgId: "123456789", organizer: "Example Org", category: "General Professional" },
];
