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
  /** Ticket pricing, free-form (e.g. "YP $15 · Chamber $25 · Public $40") */
  price?: string;
  /** Street address when known */
  address?: string;
  /** Direct registration link when different from source_url */
  registration_url?: string;
  /** Extra notes, e.g. "Members only · sold out" */
  note?: string;
  /** True for seed listings that are not real events yet */
  placeholder?: boolean;
  /** Map position (optional until geocoded) */
  lat?: number;
  lng?: number;
}

export interface TopList {
  slug: string;
  title: string;
  audience: string;
  description: string;
  /** Event ids, ranked */
  eventIds: string[];
}
