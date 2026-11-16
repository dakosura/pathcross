import { cacheLife, cacheTag } from "next/cache";
import type { Event, TopList } from "@/types";
import { supabase } from "./supabase";

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
  placeholder: true,
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


const placeholderEvents = baseEvents.map((ev) => {
  const c = coords[ev.id];
  return c ? { ...ev, lat: c[0], lng: c[1] } : ev;
});

const CHAMBER = "Chamber of Commerce Hawaii";

// Real listings, verified against the organizer's own event pages (Nov 2026).
// Coordinates are approximate (street-level), used only for the map hero.
const realEvents: Event[] = [
  {
    id: "chamber-bah-phad-nov17",
    club_id: "chamber-hawaii",
    title: "Business After Hours at PHAD Hawaii Appliance",
    category: "General Professional",
    date: "2026-11-17",
    start_time: "17:30",
    end_time: "19:30",
    location: { venue: "PHAD Showroom", city: "Aiea" },
    address: "99-1305 Koaha Place, Aiea, HI 96701",
    organizer: `${CHAMBER} with BIA Hawaii`,
    source_url: "https://business.cochawaii.org/events/details/business-after-hours-presented-by-phad-hawaii-appliance-in-partnership-with-bia-hawaii-1114906",
    registration_url: "https://business.cochawaii.org/events/register/1114906",
    city: "Honolulu",
    featured: true,
    price: "Advance: YP $15 · Chamber $25 · Public $40. At the door: $25 / $35 / $50.",
    description:
      "A relaxed evening mixer in the PHAD showroom with a guided tour, live appliance demos, a scavenger hunt and giveaways, plus refreshments. A good low-pressure way to meet a broad cross-section of Oʻahu business owners and professionals.",
    lat: 21.3855,
    lng: -157.919,
  },
  {
    id: "chamber-yp-exec-connect-nov19",
    club_id: "chamber-yp",
    title: "YP Exec Connect Lunch",
    category: "General Professional",
    date: "2026-11-19",
    start_time: "11:45",
    end_time: "13:00",
    location: { venue: "Private downtown location", city: "Honolulu" },
    organizer: `${CHAMBER} Young Professionals`,
    source_url: "https://business.cochawaii.org/events/details/yp-exec-connect-with-leina-ijacic-jacob-noh-and-kyle-shelly-sponsored-by-enterprise-rent-a-car-and-hawaiiusa-federal-credit-union-1114925",
    city: "Honolulu",
    featured: false,
    price: "Lunch and beverages included",
    note: "Members-only and currently sold out. A waitlist is available.",
    description:
      "A small YP luncheon where up to eight Young Professionals per executive sit down with three Hawaiʻi business leaders (Leina Ijacic, Jacob Noh and Kyle Shelly). The format is conversation, not pitching: listen and ask thoughtful questions.",
    lat: 21.3069,
    lng: -157.8583,
  },
  {
    id: "chamber-prediction-markets-dec1",
    club_id: "chamber-hawaii",
    title: "Can Markets Predict the Future? Prediction Markets Explained",
    category: "Finance",
    date: "2026-12-01",
    start_time: "17:00",
    end_time: "20:00",
    location: { venue: "Capital Grille Waikiki", city: "Honolulu" },
    address: "2380 Kūhiō Ave., Honolulu, HI 96815",
    organizer: `${CHAMBER}, presented by Kalshi`,
    source_url: "https://business.cochawaii.org/events/details/can-markets-predict-the-future-exploring-the-mechanics-of-prediction-markets-presented-by-kalshi-1114931",
    city: "Honolulu",
    featured: true,
    price: "Advance: YP $30 · Chamber $40. At the door: $40 / $50.",
    description:
      "How prediction markets work, what shapes their outcomes, and what they could mean for Hawaiʻi businesses and policymakers. Includes a panel Q&A with industry and government leaders, with food, drinks and networking.",
    lat: 21.2765,
    lng: -157.8236,
  },
  {
    id: "chamber-yp-syl-dec3",
    club_id: "chamber-yp",
    title: "YP x Society of Young Leaders Pau Hana",
    category: "General Professional",
    date: "2026-12-03",
    start_time: "17:30",
    end_time: "19:30",
    location: { venue: "Morning Brew Kakaʻako", city: "Honolulu" },
    address: "685 Auahi St. #113, Honolulu, HI 96813",
    organizer: `${CHAMBER} Young Professionals & Aloha United Way Society of Young Leaders`,
    source_url: "https://business.cochawaii.org/events/details/yp-x-society-of-young-leaders-pau-hana-general-membership-meeting-1114928",
    city: "Honolulu",
    featured: true,
    price: "Online: YP $15 · Public $30. At the door: $25 / $40.",
    description:
      "A joint general membership meeting celebrating a year of community impact. Hear Aloha United Way's 2027 vision, talk with nonprofit leaders, and enjoy pupus with a signature cocktail.",
    lat: 21.2975,
    lng: -157.8605,
  },
  {
    id: "chamber-rotary-connect-dec9",
    club_id: "chamber-yp",
    title: "Rotary Connect: Level Up Your Network + Your Impact",
    category: "General Professional",
    date: "2026-12-09",
    start_time: "17:30",
    end_time: "19:30",
    location: { venue: "Central Pacific Bank Tidepools", city: "Honolulu" },
    address: "220 S. King St., Honolulu, HI 96813",
    organizer: `${CHAMBER} Young Professionals & five downtown Honolulu Rotary clubs`,
    source_url: "https://business.cochawaii.org/events/details/rotary-connect-level-up-you-network-your-impact-1114929",
    city: "Honolulu",
    featured: false,
    price: "Free for YP members · $15 for Rotarians and guests",
    description:
      "Five downtown Honolulu Rotary clubs host young professionals for networking games with prize drawings, conversations with each club to find the best fit, pupus and a no-host bar. Parking is not included.",
    lat: 21.3087,
    lng: -157.8626,
  },
  {
    id: "chamber-yp-holiday-dec10",
    club_id: "chamber-yp",
    title: "YP Holiday Party: Electric Wonderland",
    category: "General Professional",
    date: "2026-12-10",
    start_time: "17:30",
    end_time: "20:00",
    location: { venue: "The Bay Event Center", city: "Honolulu" },
    address: "735 Iwilei Rd., Honolulu, HI 96817",
    organizer: `${CHAMBER} Young Professionals`,
    source_url: "https://business.cochawaii.org/events/details/yp-holiday-party-electric-wonderland-1114907",
    city: "Honolulu",
    featured: false,
    price: "Regular: YP $45 · Non-members $60. At the door: $55 / $70.",
    note: "21+ with valid photo ID.",
    description:
      "The YP year-end party: neon decor, food, drinks, music and prizes. Registration includes two drink tickets and heavy pupus.",
    lat: 21.3187,
    lng: -157.8745,
  },
  {
    id: "chamber-annual-luncheon-dec8",
    club_id: "chamber-hawaii",
    title: "176th Annual Membership Luncheon",
    category: "General Professional",
    date: "2026-12-08",
    start_time: "09:00",
    end_time: "13:30",
    location: { venue: "Hilton Hawaiian Village, Coral Ballroom", city: "Honolulu" },
    address: "2005 Kalia Rd., Honolulu, HI 96815",
    organizer: CHAMBER,
    source_url: "https://business.cochawaii.org/events/details/176th-annual-membership-luncheon-1114854",
    city: "Honolulu",
    featured: true,
    price: "YP $89 · Chamber $99 · Non-member $125",
    note: "Expo and networking from 9:00 AM; luncheon 11:30 AM to 1:30 PM.",
    description:
      "The Chamber's flagship annual gathering, in a holiday edition: exhibitor networking, a keynote on AI for business by Dan Tadross, and award presentations.",
    lat: 21.2829,
    lng: -157.8394,
  },
  {
    id: "chamber-bah-market-advantage-dec15",
    club_id: "chamber-hawaii",
    title: "Business After Hours at the 'Alohilani Swell Deck",
    category: "General Professional",
    date: "2026-12-15",
    start_time: "17:30",
    end_time: "19:30",
    location: { venue: "'Alohilani Swell Deck", city: "Honolulu" },
    address: "2490 Kalākaua Ave., Waikīkī, HI 96815",
    organizer: `${CHAMBER}, presented by Market Advantage`,
    source_url: "https://business.cochawaii.org/events/details/business-after-hours-presented-by-market-advantage-1114924",
    city: "Honolulu",
    featured: true,
    price: "YP $25 · Chamber $35 · Non-member $50 (same at the door)",
    description:
      "A holiday-themed oceanfront networking evening in Waikīkī with a tasting area, a raffle and a collection drive supporting The Salvation Army.",
    lat: 21.2745,
    lng: -157.8225,
  },
];

/** Seed data: hand-verified listings plus clearly-labelled samples. */
export const events: Event[] = [...realEvents, ...placeholderEvents];

interface EventRow {
  id: string; title: string; description: string; date: string; start_time: string; end_time: string;
  venue: string; city: string; address: string | null; organizer: string; source_url: string;
  registration_url: string | null; price: string | null; note: string | null;
  category: Event["category"]; featured: boolean; placeholder: boolean; lat: number | null; lng: number | null;
  source: string | null;
}

/**
 * Per-feed details the calendar feeds leave out (Meetup hides venues in ICS).
 * Applied when reading, so they need no database change. Venues come from each
 * group's own event descriptions.
 */
const sourceDefaults: Record<string, { club_id: string; online?: boolean; venue?: string; address?: string; lat?: number; lng?: number }> = {
  "meetup-honolulu-tech-network": { club_id: "honolulu-tech-network", venue: "Whole Foods Market Kakaʻako (outdoor café seating)", lat: 21.2947, lng: -157.8527 },
  "meetup-code-with-aloha": { club_id: "code-with-aloha", venue: "Entrepreneurs Sandbox", address: "643 Ilalo St., Honolulu, HI 96813", lat: 21.2936, lng: -157.864 },
  "meetup-honolulu-startups": { club_id: "honolulu-startups", online: true, venue: "Online" },
};

const fromRow = (r: EventRow): Event => {
  const d = (r.source && sourceDefaults[r.source]) || undefined;
  const unknownVenue = !r.venue || r.venue === "See event listing";
  return {
  id: r.id, title: r.title, description: r.description, date: r.date,
  start_time: r.start_time, end_time: r.end_time,
  location: { venue: unknownVenue && d?.venue ? d.venue : r.venue, city: r.city }, city: r.city,
  address: r.address ?? (unknownVenue ? d?.address : undefined), organizer: r.organizer, source_url: r.source_url,
  club_id: d?.club_id, online: d?.online,
  registration_url: r.registration_url ?? undefined, price: r.price ?? undefined, note: r.note ?? undefined,
  category: r.category, featured: r.featured, placeholder: r.placeholder || undefined,
  lat: r.lat ?? (d?.online ? undefined : d?.lat), lng: r.lng ?? (d?.online ? undefined : d?.lng),
  };
};

const todayHST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Honolulu" });

/**
 * Upcoming events. With Supabase configured: database rows (kept fresh by the
 * /api/cron/ingest job) plus the hand-verified listings above. Without it, or if
 * the query fails: the seed data. Cached; the ingest job busts the "events" tag.
 */
async function loadUpcoming(): Promise<Event[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  const today = todayHST();
  let list = events;
  if (supabase) {
    const { data, error } = await supabase.from("events").select("*").eq("status", "active").gte("date", today);
    if (!error && data && data.length) {
      const db = (data as EventRow[]).map(fromRow);
      const ids = new Set(db.map((e) => e.id));
      list = [...realEvents.filter((e) => !ids.has(e.id)), ...db];
    }
  }
  return list.filter((e) => e.date >= today);
}

export const categories = ["Finance", "Tech", "General Professional", "Startup"] as const;

export const topLists: TopList[] = [
  {
    slug: "financial-advisors",
    title: "Top 10 for Financial Advisors",
    audience: "Financial Advisors",
    description: "Upcoming Honolulu events worth a financial advisor's time. Real listings come first; sample listings fill the rest until more are verified.",
    eventIds: ["chamber-prediction-markets-dec1", "chamber-bah-phad-nov17", "chamber-yp-syl-dec3", "fin-mixer-1", "fin-planning-1", "fin-estate-1", "gen-breakfast-1", "gen-happy-1", "startup-pitch-1", "tech-meetup-1", "startup-coffee-1", "tech-ai-1"],
  },
];

/** Today's date in Honolulu, e.g. "2026-11-15". Cached with the event list. */
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  return todayHST();
}

export async function getEvents(): Promise<Event[]> {
  return [...(await loadUpcoming())].sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return (await getEvents()).filter((ev) => ev.featured);
}

export async function getEvent(id: string): Promise<Event | undefined> {
  return (await loadUpcoming()).find((ev) => ev.id === id);
}

export async function getTopList(slug: string) {
  const list = topLists.find((l) => l.slug === slug);
  if (!list) return undefined;
  const all = await loadUpcoming();
  const items = list.eventIds
    .map((id) => all.find((ev) => ev.id === id))
    .filter((x): x is Event => Boolean(x));
  return { ...list, items };
}
