import { cacheLife, cacheTag } from "next/cache";
import type { Event } from "@/types";
import { supabase } from "./supabase";
import { addDays, datesBetween, occurrence, splitOccurrenceId, occursOn, type Series } from "./recurring";
import { series } from "./weekly-events";

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
  {
    id: "brew-house-all-white-dec6",
    title: "Brew & House Hawaii: All White Edition",
    category: "Community",
    date: "2026-12-06",
    start_time: "11:00",
    end_time: "14:00",
    location: { venue: "Hideout at The Laylow", city: "Honolulu" },
    address: "2299 Kūhiō Ave., 1st Floor, Honolulu, HI 96815",
    organizer: "Brew & House Hawaii",
    source_url: "https://avenueticket.com/event/brew-and-house-hawaii-all-white-edition",
    city: "Honolulu",
    featured: false,
    price: "Ticketed through Avenue Ticketing; one listed ticket is $22.69",
    note: "All-white dress code. Family-friendly; food and drinks are sold on site.",
    description:
      "A Sunday-afternoon social in Waikīkī with specialty coffee and matcha, house music and live DJ sets. A relaxed, come-as-you-are way to meet new people and see familiar faces while closing out the year.",
    lat: 21.27946,
    lng: -157.82639,
  },
  {
    id: "hirei-monthly-dec3",
    club_id: "hawaii-real-estate-investors",
    title: "Hawaii Real Estate Investors Monthly Meeting",
    category: "Real Estate",
    date: "2026-12-03",
    start_time: "18:00",
    end_time: "20:30",
    location: { venue: "McCully-Moiliili Public Library", city: "Honolulu" },
    address: "2211 S King St., Honolulu, HI 96826",
    organizer: "Hawaii Real Estate Investors",
    source_url: "https://www.meetup.com/hawaii-rei/events/317157294/",
    city: "Honolulu",
    featured: false,
    price: "$10 at the door",
    note: "Doors open at 5:30 PM.",
    description:
      "The main monthly meeting of the Hawaii Real Estate Investors group, held on the first Thursday of the month: education and networking for people starting out in real estate investing and for experienced investors.",
    lat: 21.29351,
    lng: -157.82779,
  },
  {
    id: "rei-aloha-happy-hour-dec10",
    club_id: "rei-aloha",
    title: "Passive Investor Happy Hour at PAI Honolulu",
    category: "Real Estate",
    date: "2026-12-10",
    start_time: "19:45",
    end_time: "21:45",
    location: { venue: "PAI Honolulu", city: "Honolulu" },
    organizer: "REI Aloha: Hawaii Passive Accredited Investor Club",
    source_url: "https://www.meetup.com/rei808-passive-real-estate-investing-for-the-working-class/events/pjxlbvyjcqbnb/",
    city: "Honolulu",
    featured: false,
    note: "For accredited and experienced passive investors, including those visiting the islands.",
    description:
      "An open evening for passive investors in private real estate: open networking, a short presentation on the month's topic followed by discussion, then mastermind breakouts and structured networking.",
  },
  {
    id: "blockchain-paradise-pau-hana-dec11",
    club_id: "blockchain-in-paradise",
    title: "Blockchain in Paradise: End of Year Pau Hana",
    category: "Finance",
    date: "2026-12-11",
    start_time: "18:00",
    end_time: "20:00",
    location: { venue: "Hana Koa Brewing Co", city: "Honolulu" },
    address: "962 Kawaiahao St., Honolulu, HI 96814",
    organizer: "Blockchain in Paradise",
    source_url: "https://www.meetup.com/hawaii-blockchain-innovation/events/317502243/",
    city: "Honolulu",
    featured: false,
    description:
      "An end-of-year pau hana to catch up, talk story and close out 2026 together. Relaxed conversation about blockchain, crypto and digital money, with familiar faces, new ones and plenty of time to connect.",
    lat: 21.29717,
    lng: -157.85292,
  },
  {
    id: "ccim-irem-forecast-jan21",
    club_id: "hawaii-ccim-chapter",
    title: "CCIM/IREM Real Estate Forecast",
    category: "Real Estate",
    date: "2027-01-21",
    start_time: "08:30",
    end_time: "11:30",
    location: { venue: "Hawaii Prince Hotel, Piinaio Ballroom", city: "Honolulu" },
    address: "100 Holomoana St., Honolulu, HI 96815",
    organizer: "Hawaii CCIM Chapter and IREM",
    source_url: "https://ccimhawaii.starchapter.com/meetinginfo.php",
    city: "Honolulu",
    featured: false,
    description:
      "The CCIM and IREM chapters look ahead at the future of commercial real estate in Hawaiʻi, with the market outlook and a morning of networking with commercial real estate professionals.",
    lat: 21.28617,
    lng: -157.84002,
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
  "meetup-blockchain-in-paradise": { club_id: "blockchain-in-paradise" },
  "meetup-honolulu-bitcoin": { club_id: "honolulu-bitcoin" },
  "meetup-hawaii-rei": { club_id: "hawaii-real-estate-investors", venue: "McCully-Moiliili Public Library", address: "2211 S King St., Honolulu, HI 96826", lat: 21.29351, lng: -157.82779 },
  "meetup-rei-aloha": { club_id: "rei-aloha" },
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

export const categories = ["Finance", "Tech", "General Professional", "Startup", "Real Estate", "Food & Drink", "Sports", "Community", "Fitness", "Volunteer"] as const;

/** How far ahead the calendar lists each repeating event. */
const CALENDAR_DAYS = 70;

/**
 * Repeating events (see weekly-events.ts). `next` is each series' coming date
 * under its stable id, for lists; `all` is every date in the next ten weeks
 * under date-stamped ids, for the calendar. Cached with the event list.
 */
async function loadWeekly(): Promise<{ next: { series: Series; event: Event }[]; all: Event[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  const today = todayHST();
  const next: { series: Series; event: Event }[] = [];
  const all: Event[] = [];
  for (const s of series) {
    // Select dates can fall well beyond the calendar window, so look a year ahead for the next one.
    const upcoming = datesBetween(s, today, 366);
    if (upcoming.length) next.push({ series: s, event: occurrence(s, upcoming[0]) });
    for (const d of datesBetween(s, today, CALENDAR_DAYS)) all.push(occurrence(s, d, true));
  }
  return { next, all };
}

/**
 * Events from the last few months, for My Network's follow-up ("did you go, who
 * did you meet, was the rating right?"). The main lists only hold upcoming events.
 */
export async function getRecentEvents(days = 90): Promise<Event[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  const today = todayHST();
  const cutoff = addDays(today, -days);
  const out: Event[] = realEvents.filter((e) => e.date < today && e.date >= cutoff);
  if (supabase) {
    const { data, error } = await supabase.from("events").select("*").eq("status", "active").lt("date", today).gte("date", cutoff);
    if (!error && data) {
      const curated = new Set(realEvents.flatMap((e) => [e.id, e.source_url]));
      out.push(...(data as EventRow[]).map(fromRow).filter((e) => !curated.has(e.id) && !curated.has(e.source_url)));
    }
  }
  // Past dates of repeating events, under the same date-stamped ids the calendar uses.
  for (const s of series) for (const d of datesBetween(s, cutoff, days - 1)) if (d < today) out.push(occurrence(s, d, true));
  return out.sort((a, b) => b.date.localeCompare(a.date) || b.start_time.localeCompare(a.start_time));
}

/** Today's date in Honolulu, e.g. "2026-11-15". Cached with the event list. */
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  return todayHST();
}

const byTime = (a: Event, b: Event) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time);

/** One-off events plus the next date of each repeating event. */
export async function getEvents(): Promise<Event[]> {
  const [oneOff, weekly] = await Promise.all([loadUpcoming(), loadWeekly()]);
  return [...oneOff, ...weekly.next.map((n) => n.event)].sort(byTime);
}

/** One-off events plus every date of every repeating event for the next ten weeks. */
export async function getCalendarEvents(): Promise<Event[]> {
  const [oneOff, weekly] = await Promise.all([loadUpcoming(), loadWeekly()]);
  return [...oneOff, ...weekly.all].sort(byTime);
}

/** Every repeating event with its next date, soonest first. */
export async function getWeeklySeries(): Promise<{ series: Series; event: Event }[]> {
  return [...(await loadWeekly()).next].sort((a, b) => byTime(a.event, b.event));
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return (await getEvents()).filter((ev) => ev.featured);
}

export async function getEvent(id: string): Promise<Event | undefined> {
  const found = (await getEvents()).find((ev) => ev.id === id);
  if (found) return found;
  // A date-stamped link into a repeating event ("series--2026-11-21"), as the calendar uses.
  const parts = splitOccurrenceId(id);
  const s = parts && series.find((x) => x.id === parts.series);
  if (parts && s && occursOn(s, parts.date) && parts.date >= (await getToday())) return occurrence(s, parts.date, true);
  return undefined;
}
