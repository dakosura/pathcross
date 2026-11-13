export type EventCategory =
  | "Finance"
  | "Tech"
  | "General Professional"
  | "Startup";

export interface Event {
  id: string;
  title: string;
  description: string;
  /** ISO date, e.g. "2026-12-04" */
  date: string;
  /** 24h time, e.g. "17:30" */
  start_time: string;
  end_time: string;
  location: { venue: string; city: string };
  category: EventCategory;
  organizer: string;
  source_url: string;
  /** Defaults to Honolulu */
  city: string;
  featured: boolean;
}

export interface TopList {
  slug: string;
  title: string;
  audience: string;
  description: string;
  /** Event ids, ranked */
  eventIds: string[];
}
