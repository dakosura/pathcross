import type { Event, TopList } from "@/types";

// Placeholder seed data. Swap these functions for Supabase queries later;
// pages only depend on the function signatures.
const e = (
  id: string,
  title: string,
  category: Event["category"],
  date: string,
  start_time: string,
  end_time: string,
  venue: string,
  organizer: string,
  featured = false,
): Event => ({
  id,
  title,
  category,
  date,
  start_time,
  end_time,
  location: { venue, city: "Honolulu" },
  organizer,
  source_url: "https://example.com",
  city: "Honolulu",
  featured,
  description:
    "Placeholder description. Meet local professionals, trade ideas, and build relationships in a relaxed setting. Real event details will be added during curation.",
});

// Placeholder coordinates [lat, lng] per event
const coords: Record<string, [number, number]> = {
  "waikiki-happy-hour": [21.2720, -157.8211],
  "fin-mixer-1": [21.3068, -157.8654],
  "tech-meetup-1": [21.2955, -157.8567],
  "startup-pitch-1": [21.2905, -157.853],
  "gen-breakfast-1": [21.3092, -157.8601],
  "fin-planning-1": [21.2793, -157.8294],
  "gen-happy-1": [21.3, -157.859],
  "tech-ai-1": [21.3011, -157.8588],
  "startup-coffee-1": [21.2987, -157.8612],
  "fin-estate-1": [21.3086, -157.8618],
};

const baseEvents: Event[] = [
  e("waikiki-happy-hour", "Sunset Happy Hour on the Deck", "General Professional", "2026-11-18", "17:00", "19:00", "DECK. at Queen Kapiʻolani Hotel", "Placeholder YP Club", true),
  e("fin-mixer-1", "Financial Advisors Mixer", "Finance", "2026-11-19", "17:30", "19:30", "Aloha Tower Marketplace", "Placeholder Advisors Group", true),
  e("tech-meetup-1", "Island Tech Meetup", "Tech", "2026-11-20", "18:00", "20:00", "Kakaʻako Coworking Hub", "Placeholder Tech Collective", true),
  e("startup-pitch-1", "Startup Pitch Night", "Startup", "2026-11-24", "18:30", "21:00", "Ward Village Event Space", "Placeholder Founders Network", true),
  e("gen-breakfast-1", "Downtown Professionals Breakfast", "General Professional", "2026-11-26", "07:30", "09:00", "Downtown Café Venue", "Placeholder Chamber Group"),
  e("fin-planning-1", "Retirement Planning Roundtable", "Finance", "2026-12-02", "12:00", "13:30", "Waikīkī Business Lounge", "Placeholder CFP Chapter", true),
  e("gen-happy-1", "Young Professionals Happy Hour", "General Professional", "2026-12-04", "17:00", "19:00", "Rooftop Bar, Honolulu", "Placeholder YP Club"),
  e("tech-ai-1", "AI in Business Workshop", "Tech", "2026-12-09", "17:30", "19:30", "Innovation Center Honolulu", "Placeholder AI Guild"),
  e("startup-coffee-1", "Founders Coffee Chat", "Startup", "2026-12-11", "08:00", "09:30", "Local Coffee Roastery", "Placeholder Founders Network"),
  e("fin-estate-1", "Estate & Wealth Planning Panel", "Finance", "2026-12-16", "17:30", "19:30", "Bishop Street Conference Room", "Placeholder Advisors Group"),
];

export const events: Event[] = baseEvents.map((ev) => {
  const c = coords[ev.id];
  return c ? { ...ev, lat: c[0], lng: c[1] } : ev;
});

export const categories = ["Finance", "Tech", "General Professional", "Startup"] as const;

export const topLists: TopList[] = [
  {
    slug: "financial-advisors",
    title: "Top 10 for Financial Advisors",
    audience: "Financial Advisors",
    description: "Placeholder ranking of the best networking events and groups for advisors in Honolulu.",
    eventIds: ["fin-mixer-1", "fin-planning-1", "fin-estate-1", "gen-breakfast-1", "gen-happy-1", "startup-pitch-1", "tech-meetup-1", "startup-coffee-1", "tech-ai-1"],
  },
];

export async function getEvents(): Promise<Event[]> {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return (await getEvents()).filter((ev) => ev.featured);
}

export async function getEvent(id: string): Promise<Event | undefined> {
  return events.find((ev) => ev.id === id);
}

export async function getTopList(slug: string) {
  const list = topLists.find((l) => l.slug === slug);
  if (!list) return undefined;
  const items = list.eventIds
    .map((id) => events.find((ev) => ev.id === id))
    .filter((x): x is Event => Boolean(x));
  return { ...list, items };
}
