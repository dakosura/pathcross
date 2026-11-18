export type EventCategory =
  | "Finance"
  | "Tech"
  | "General Professional"
  | "Startup"
  | "Community"
  | "Fitness"
  | "Volunteer";

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
  /** Group that hosts it (see src/lib/clubs.ts) */
  club_id?: string;
  /** Set for repeating events, e.g. "Every Saturday" */
  recurrence?: string;
  /** The repeating series this date belongs to (see src/lib/weekly-events.ts) */
  series_id?: string;
  /** Online-only; no map pin */
  online?: boolean;
  /** True for seed listings that are not real events yet */
  placeholder?: boolean;
  /** Map position (optional until geocoded) */
  lat?: number;
  lng?: number;
}

export type InterestId = "professional" | "fitness" | "golf" | "social" | "boating" | "volunteer";

export interface PriceLine {
  /** e.g. "Monthly membership" */
  label: string;
  /** e.g. "$49 / month" */
  amount: string;
  note?: string;
}

/** A club, gym, program or other membership organization in the directory. */
export interface Club {
  id: string;
  name: string;
  interest: InterestId;
  blurb: string;
  /** The organization's own site */
  url?: string;
  /** Neighborhood label, or "Online" */
  area: string;
  address?: string;
  /** How to join, eligibility, guest policy. Public info only. */
  membership?: string;
  /** Publicly posted prices. Leave empty when not published. */
  pricing?: PriceLine[];
  /** ISO date the pricing was last checked */
  pricing_as_of?: string;
  /** Page the pricing came from */
  pricing_source?: string;
  /** What is on site or on offer, as short labels (e.g. "Pool", "Dining") */
  facilities?: string[];
  phone?: string;
  /** Listed, but details not researched yet */
  pending?: boolean;
  lat?: number;
  lng?: number;
}
