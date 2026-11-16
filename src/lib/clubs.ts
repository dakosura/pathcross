import type { Club } from "@/types";

/**
 * The Clubs & Programs directory. Only publicly available information, taken
 * from each organization's own pages. Map positions are approximate.
 *
 * To add a listing: append an entry with its `interest`. Set `pending: true`
 * until details are verified; add `pricing` (+ `pricing_as_of`, `pricing_source`)
 * only when the organization publishes prices.
 */
export const clubs: Club[] = [
  {
    id: "chamber-hawaii",
    name: "Chamber of Commerce Hawaii",
    blurb: "The statewide business association. Hosts Business After Hours mixers, panels and the annual membership luncheon.",
    interest: "professional",
    url: "https://www.cochawaii.org",
    area: "Downtown Honolulu",
    lat: 21.3083,
    lng: -157.8622,
  },
  {
    id: "chamber-yp",
    name: "Chamber Young Professionals",
    blurb: "The Chamber's program for career-minded professionals aged 21 to 39: pau hanas, executive lunches and meet-and-greets with legislators.",
    interest: "professional",
    url: "https://cochawaii.org/programs/young-professionals-program",
    area: "Downtown Honolulu",
    lat: 21.3071,
    lng: -157.8607,
  },
  {
    id: "fpa-hawaii",
    name: "FPA of Hawaii",
    blurb: "The local chapter of the Financial Planning Association. Monthly lunch programs from January to October, plus an annual symposium.",
    interest: "professional",
    url: "https://www.financialplanningassociation.org/chapter/fpa-hawaii",
    area: "Honolulu",
    lat: 21.3098,
    lng: -157.8588,
  },
  {
    id: "honolulu-tech-network",
    name: "Honolulu Tech Network",
    blurb: "A low-key weekly meetup for people who work in tech, want to, or just like tinkering. No set topic; newcomers welcome.",
    interest: "professional",
    url: "https://www.meetup.com/honolulu-tech-network/",
    area: "Kakaʻako",
    lat: 21.2947,
    lng: -157.8527,
  },
  {
    id: "code-with-aloha",
    name: "Code with Aloha",
    blurb: "Volunteer developers, designers and project managers building civic-tech projects for Hawaiʻi. Monthly intro and onboarding night.",
    interest: "professional",
    url: "https://www.meetup.com/code-with-aloha/",
    area: "Kakaʻako",
    lat: 21.2936,
    lng: -157.864,
  },
  {
    id: "honolulu-startups",
    name: "Honolulu Technology Startups Meetup",
    blurb: "Founders and investors group. Runs free weekly online fundraising office hours.",
    interest: "professional",
    url: "https://www.meetup.com/honolulu-technology-startups-meetup-group/",
    area: "Online",
  },
  // --- Listed, details still to be researched ---
  {
    id: "honolulu-elks-lodge",
    name: "Honolulu Elks Lodge",
    interest: "social",
    blurb: "Member lodge in Waikīkī. Membership details and public pricing are still being gathered.",
    area: "Waikīkī",
    pending: true,
  },
];

export const clubById = (id?: string) => clubs.find((c) => c.id === id);
export const clubsByInterest = (interest: string) => clubs.filter((c) => c.interest === interest);
