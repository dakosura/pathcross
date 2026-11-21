import type { InterestId } from "@/types";

export interface Interest {
  id: InterestId;
  name: string;
  short: string;
  blurb: string;
  /** What a listing in this interest typically shows */
  covers: string[];
  hex: string;
  /** Tailwind classes (kept literal so they are generated) */
  tile: string;
  badge: string;
}

export const interests: Interest[] = [
  {
    id: "professional",
    name: "Professional & networking groups",
    short: "Professional",
    blurb: "Chambers, industry associations, tech, founder, investing and crypto communities.",
    covers: ["Who it's for", "How to join", "Upcoming events"],
    hex: "#1e3a2f",
    tile: "bg-forest text-cream",
    badge: "bg-moss-50 text-forest",
  },
  {
    id: "realestate",
    name: "Real estate",
    short: "Real estate",
    blurb: "Investor groups, REALTOR and commercial real estate associations, seminars and happy hours.",
    covers: ["Who it's for", "Meeting schedule", "How to join"],
    hex: "#8a6a2f",
    tile: "bg-[#8a6a2f] text-white",
    badge: "bg-[#f1e8d3] text-[#6b501f]",
  },
  {
    id: "food",
    name: "Food & drink",
    short: "Food & drink",
    blurb: "Food festivals, restaurant weeks, cooking classes and clubs for people who love to eat and drink well.",
    covers: ["What happens", "When it runs", "How to get in"],
    hex: "#9a4a3a",
    tile: "bg-[#9a4a3a] text-white",
    badge: "bg-[#f4e1dc] text-[#7a3a2d]",
  },
  {
    id: "sports",
    name: "Sports clubs & leagues",
    short: "Sports",
    blurb: "Pickleball, volleyball, surfing, swimming, tennis and recreational leagues, from open play to organized clubs.",
    covers: ["Where and when they play", "Skill levels", "How to join"],
    hex: "#35567a",
    tile: "bg-[#35567a] text-white",
    badge: "bg-[#e1e9f2] text-[#2c4663]",
  },
  {
    id: "fitness",
    name: "Gyms, fitness & run clubs",
    short: "Fitness",
    blurb: "Gyms, studios, run clubs and training groups, with their latest posted prices.",
    covers: ["Membership prices", "Run clubs", "Locations"],
    hex: "#c17f4a",
    tile: "bg-clay text-white",
    badge: "bg-clay-50 text-clay-700",
  },
  {
    id: "golf",
    name: "Golf clubs",
    short: "Golf",
    blurb: "Private and public courses, memberships and green fees.",
    covers: ["Membership types", "Green fees", "Guest policy"],
    hex: "#4a6b4f",
    tile: "bg-moss text-white",
    badge: "bg-moss-50 text-moss",
  },
  {
    id: "social",
    name: "Member & social clubs",
    short: "Member clubs",
    blurb: "Lodges, private clubs and service organizations.",
    covers: ["How to join", "Dues, when public", "Facilities"],
    hex: "#5c4a3a",
    tile: "bg-bark text-cream",
    badge: "bg-sand text-bark",
  },
  {
    id: "boating",
    name: "Yacht & boating clubs",
    short: "Boating",
    blurb: "Yacht clubs, sailing programs and paddling clubs.",
    covers: ["Membership types", "Programs", "Reciprocity"],
    hex: "#2f6f7a",
    tile: "bg-lagoon text-white",
    badge: "bg-lagoon-50 text-lagoon",
  },
  {
    id: "volunteer",
    name: "Volunteering & charity",
    short: "Volunteer",
    blurb: "Food banks, animal shelters, beach cleanups and other ways to give time on Oʻahu.",
    covers: ["What volunteers do", "Minimum age", "How to sign up"],
    hex: "#3f6b5a",
    tile: "bg-[#3f6b5a] text-white",
    badge: "bg-[#dfe9df] text-forest",
  },
];

export const interestById = (id?: string) => interests.find((i) => i.id === id);
