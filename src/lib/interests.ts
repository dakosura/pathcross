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
    blurb: "Chambers, industry associations, tech and founder communities.",
    covers: ["Who it's for", "How to join", "Upcoming events"],
    hex: "#1e3a2f",
    tile: "bg-forest text-cream",
    badge: "bg-moss-50 text-forest",
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
