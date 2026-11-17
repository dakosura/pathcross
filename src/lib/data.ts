import { cacheLife, cacheTag } from "next/cache";
import type { Event } from "@/types";
import { supabase } from "./supabase";

const CHAMBER = "Chamber of Commerce Hawaii";

// Hand-edited listings for Chamber events: tidier descriptions and prices than
// the automatic import produces, plus a map position. The Chamber calendar is
// also imported daily (see src/lib/ingest/sources.ts); when an imported event
// has the same source_url as one below, the version below is shown. New Chamber
// events appear on their own, so this list never has to be kept complete.
// Coordinates were geocoded from each street address (OpenStreetMap).
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
    lat: 21.3744,
    lng: -157.90186,
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
    lat: 21.27846,
    lng: -157.82446,
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
    lat: 21.29769,
    lng: -157.86045,
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
    lat: 21.30779,
    lng: -157.86049,
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
    lat: 21.3154,
    lng: -157.8704,
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
    lat: 21.28318,
    lng: -157.83572,
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
    lat: 21.27608,
    lng: -157.82575,
  },
];

/** Hand-verified listings. Also the fallback when the database is unreachable. */
export const events: Event[] = realEvents;

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
  "meetup-code-with-aloha": { club_id: "code-with-aloha", venue: "Entrepreneurs Sandbox", address: "643 Ilalo St., Honolulu, HI 96813", lat: 21.29684, lng: -157.86349 },
  "meetup-honolulu-startups": { club_id: "honolulu-startups", online: true, venue: "Online" },
  "chamber-hawaii": { club_id: "chamber-hawaii" },
};

/** Chamber events run by its Young Professionals program are titled "YP ...". */
const clubFor = (r: EventRow, fallback?: string) =>
  r.source === "chamber-hawaii" && /^YP\b/.test(r.title) ? "chamber-yp" : fallback;

const fromRow = (r: EventRow): Event => {
  const d = (r.source && sourceDefaults[r.source]) || undefined;
  const unknownVenue = !r.venue || r.venue === "See event listing";
  return {
  id: r.id, title: r.title, description: r.description, date: r.date,
  start_time: r.start_time, end_time: r.end_time,
  location: { venue: unknownVenue && d?.venue ? d.venue : r.venue, city: r.city }, city: r.city,
  address: r.address ?? (unknownVenue ? d?.address : undefined), organizer: r.organizer, source_url: r.source_url,
  club_id: clubFor(r, d?.club_id), online: d?.online || /^(zoom|online|virtual|webinar)\b/i.test(r.venue) || undefined,
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
      // Hand-edited listings win over the imported copy of the same event.
      const curated = new Set(realEvents.flatMap((e) => [e.id, e.source_url]));
      const db = (data as EventRow[]).map(fromRow).filter((e) => !curated.has(e.id) && !curated.has(e.source_url));
      list = [...realEvents, ...db];
    }
  }
  return list.filter((e) => e.date >= today);
}

export const categories = ["Finance", "Tech", "General Professional", "Startup"] as const;

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
