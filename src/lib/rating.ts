import type { Event, EventCategory } from "@/types";
import { goalLabel, hasProfile, professionLabel, type GoalId, type ProfessionId, type Profile } from "./profile";

/**
 * The PathCross networking rating: 1 to 5 stars for how useful an event is
 * likely to be for meeting people, plus short insights for going in.
 *
 * It is calculated, not crowd-sourced: from the event's format (a mixer beats a
 * webinar), whether it is in person, who hosts it, and, when the visitor has
 * told us their profession and goals, how well the topic fits them. The same
 * inputs always give the same answer, so the page can explain every star.
 */
export interface Rating {
  /** Whole stars, 1 to 5 */
  stars: number;
  /** Unrounded score, for ranking */
  score: number;
  personalized: boolean;
  /** One-line verdict */
  summary: string;
  /** Why it scored this way */
  reasons: string[];
  /** Practical advice for the event */
  tip: string;
}

type Format = "mixer" | "meal" | "conference" | "learn" | "meetup" | "market" | "run" | "volunteer" | "other";

const VOLUNTEER = { format: "volunteer" as Format, base: 3.4, label: "Working side by side builds real connections quickly", tip: "Sign up ahead and arrive on time. Offer to be paired with someone new; shared work makes introductions easy." };

const FORMATS: { format: Format; test: RegExp; base: number; label: string; tip: string }[] = [
  { format: "mixer", test: /mixer|pau hana|after hours|happy hour|networking|holiday party|social hour|reception|meet[- ]and[- ]greet/, base: 4, label: "Open mingling format, built for meeting people", tip: "Arrive in the first 20 minutes. People are easiest to approach before groups form." },
  { format: "conference", test: /summit|conference|expo\b|symposium|convention/, base: 3.75, label: "Large gathering with lots of people in one place", tip: "Pick two or three people you want to find rather than trying to work the whole room." },
  { format: "meal", test: /luncheon|lunch\b|breakfast|dinner|gala|brunch/, base: 3.5, label: "Seated meal: fewer people, longer conversations", tip: "Your table decides who you meet. Arrive early enough to choose your seat." },
  { format: "learn", test: /workshop|class\b|seminar|training|webinar|panel|office hours|q&a|onboarding|explained|course/, base: 3, label: "Mostly a learning session, with some time to talk", tip: "The best conversations happen in the Q&A and the ten minutes after. Stay for them." },
  { format: "run", test: /run club|runners|marathon clinic|run\. drink|group run/, base: 3.5, label: "Regular group run: the same faces each week and easy conversation", tip: "Pace yourself so you can talk. The stop afterward is where most of the networking happens." },
  { format: "market", test: /farmers market|market day|\bmarket\b/, base: 2.75, label: "Browse-and-chat setting: you meet vendors and neighbors, not a networking crowd", tip: "Go with a friend, or turn it into a weekly habit. Regular vendors and shoppers start to know you." },
  { format: "meetup", test: /meetup|meet up|hangout|coffee/, base: 3.25, label: "Casual, recurring meetup with regulars", tip: "Regulars set the tone. Go twice before you judge it; the second visit is when people remember you." },
];

const AFFINITY: Record<ProfessionId, Record<EventCategory, number>> = {
  "financial-advisor": { Finance: 1, "General Professional": 0.85, Startup: 0.55, Tech: 0.3, Community: 0.35, Fitness: 0.35, Volunteer: 0.5 },
  founder: { Startup: 1, Tech: 0.8, "General Professional": 0.65, Finance: 0.55, Community: 0.35, Fitness: 0.4, Volunteer: 0.4 },
  "business-owner": { "General Professional": 1, Startup: 0.65, Finance: 0.6, Tech: 0.4, Community: 0.45, Fitness: 0.35, Volunteer: 0.5 },
  "real-estate": { "General Professional": 1, Finance: 0.8, Startup: 0.5, Tech: 0.3, Community: 0.5, Fitness: 0.35, Volunteer: 0.5 },
  tech: { Tech: 1, Startup: 0.8, "General Professional": 0.45, Finance: 0.25, Community: 0.35, Fitness: 0.45, Volunteer: 0.35 },
  sales: { "General Professional": 1, Startup: 0.7, Finance: 0.6, Tech: 0.6, Community: 0.45, Fitness: 0.4, Volunteer: 0.45 },
  legal: { "General Professional": 0.9, Finance: 0.8, Startup: 0.6, Tech: 0.3, Community: 0.35, Fitness: 0.3, Volunteer: 0.5 },
  healthcare: { "General Professional": 0.85, Finance: 0.5, Startup: 0.45, Tech: 0.4, Community: 0.4, Fitness: 0.45, Volunteer: 0.55 },
  creative: { "General Professional": 0.8, Startup: 0.7, Tech: 0.6, Finance: 0.3, Community: 0.5, Fitness: 0.4, Volunteer: 0.45 },
  student: { "General Professional": 0.85, Tech: 0.7, Startup: 0.7, Finance: 0.65, Community: 0.5, Fitness: 0.5, Volunteer: 0.6 },
  other: { "General Professional": 0.8, Finance: 0.6, Startup: 0.6, Tech: 0.6, Community: 0.5, Fitness: 0.5, Volunteer: 0.5 },
  social: { "General Professional": 0.7, Startup: 0.5, Tech: 0.5, Finance: 0.4, Community: 0.9, Fitness: 0.9, Volunteer: 0.8 },
};

/** A goal adds to the score when the event matches its formats, categories or words. */
const GOAL_RULES: Record<GoalId, { formats?: Format[]; categories?: EventCategory[]; words?: RegExp }> = {
  network: { formats: ["mixer", "conference", "meal"] },
  clients: { formats: ["mixer", "meal"], categories: ["General Professional", "Finance"] },
  hnw: { words: /\bgala\b|annual (membership )?luncheon|\bexecutives?\b|\bexec\b|country club|yacht club|capital grille|\binvestors?\b|\bwealth\b|estate planning/ },
  founders: { categories: ["Startup"], words: /\bfounders?\b|\binvestors?\b|\bpitch\b|fundrais|\bstartups?\b|start-up|entrepreneur/ },
  career: { words: /\bcareers?\b|\bhiring\b|\bjobs?\b|professional development|exec connect|\bmentor/ },
  learn: { formats: ["learn", "conference"] },
  hobbies: { categories: ["Community", "Fitness"], words: /\bclass\b|\btour\b|field trip|\bgolf\b|paddl|\bhike\b|\bart\b|\bwine\b|tasting/ },
  friends: { formats: ["mixer", "meetup", "run", "volunteer"], words: /party|pau hana|happy hour|social/ },
  active: { categories: ["Fitness"], words: /\brun\b|\bwalk\b|\bgolf\b|paddl|fitness|\byoga\b|\bhike\b|tournament/ },
  service: { categories: ["Volunteer"], words: /volunteer|nonprofit|non-profit|\brotary\b|\blions\b|community impact|civic|united way|charity|collection drive/ },
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function rateEvent(ev: Event, profile?: Profile): Rating {
  const text = `${ev.title} ${ev.description} ${ev.location.venue} ${ev.price ?? ""} ${ev.note ?? ""}`.toLowerCase();
  const f = ev.category === "Volunteer" ? VOLUNTEER : FORMATS.find((x) => x.test.test(`${ev.title} ${ev.location.venue}`.toLowerCase())) ?? FORMATS.find((x) => x.test.test(text));
  const format: Format = f?.format ?? "other";
  const reasons: string[] = [];
  let score = f?.base ?? 3;
  let tip = f?.tip ?? "Read the organizer's listing first so you know who the event is aimed at.";
  if (f) reasons.push(f.label);

  if (ev.online) {
    score = Math.min(score, 2.5) - 0.5;
    reasons.length = 0;
    reasons.push("Online only: useful for learning, limited for meeting people");
    tip = "Use the chat, ask one good question, and follow up by email the same day.";
  } else {
    if (/up to (eight|ten|\d+)|small group|roundtable|limited (seats|space|to)/.test(text)) { score += 0.4; reasons.push("Small group, so you get real time with everyone"); }
    if (/chamber of commerce/i.test(ev.organizer)) { score += 0.15; reasons.push("Chamber crowd: owners and managers from many industries"); }
    if (ev.featured) score += 0.2;
  }

  if (ev.price) {
    if (/\bfree\b|complimentary/.test(ev.price.toLowerCase()) && !/\$\s?\d/.test(ev.price)) reasons.push("Free to attend");
    else if (/\$\s?\d/.test(ev.price)) reasons.push("Paid ticket, which tends to draw people who mean to be there");
  }
  if (/sold out|waitlist/.test(text)) { score -= 1; reasons.push("Sold out or waitlisted when we checked"); }
  else if (/members?[- ]only/.test(text)) reasons.push("Members only: check you can get in before planning around it");

  const personalized = Boolean(profile && hasProfile(profile));
  if (personalized && profile) {
    if (profile.profession) {
      const fit = AFFINITY[profile.profession][ev.category];
      // Fit moves the score by up to about half a star either way.
      score += (fit - 0.6) * 1.5;
      const who = professionLabel(profile.profession)!.toLowerCase();
      if (profile.profession === "social") {
        if (format === "mixer" || format === "meetup") { score += 0.5; reasons.unshift("Relaxed and social, a good fit if you're here for fun"); }
      } else if (fit >= 0.8) reasons.unshift(`${ev.category === "General Professional" ? "A broad business crowd" : `${ev.category} topic`}, a strong fit for ${who === "other profession" ? "your work" : `a ${who}`}`);
      else if (fit <= 0.4) reasons.unshift(`${ev.category} focus, so fewer people in your field`);
    }
    const hits: string[] = [];
    for (const g of profile.goals) {
      const r = GOAL_RULES[g];
      if (ev.online && g !== "learn") continue;
      const match = (r.formats?.includes(format) ?? false) || (r.categories?.includes(ev.category) ?? false) || (r.words?.test(text) ?? false);
      if (match) hits.push(goalLabel(g)!.toLowerCase());
    }
    if (hits.length) {
      score += Math.min(1, 0.45 * hits.length);
      reasons.unshift(`Fits your goal to ${hits.slice(0, 2).join(" and ")}`);
    }
  }

  score = clamp(score, 1, 5);
  // Five stars is deliberately hard to reach: it takes a strong format plus a personal fit.
  const stars = score >= 4.7 ? 5 : score >= 3.75 ? 4 : score >= 2.9 ? 3 : score >= 2 ? 2 : 1;
  const verdicts = ["", "Low networking value", "Limited networking value", "Decent for meeting people", "Good for meeting people", "Excellent for meeting people"];
  const forYou = ["", "Probably not for you", "A weak match for you", "A fair match for you", "A good match for you", "A top match for you"];
  return { stars, score, personalized, summary: (personalized ? forYou : verdicts)[stars], reasons: reasons.slice(0, 4), tip };
}

/** Best-rated first, one slot per repeating series, soonest date breaking ties. */
export function rankEvents(events: Event[], profile?: Profile, limit = 10) {
  const seen = new Set<string>();
  return events
    .filter((ev) => { const k = `${ev.organizer}|${ev.title}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .map((ev) => ({ ev, rating: rateEvent(ev, profile) }))
    .sort((a, b) => b.rating.score - a.rating.score || a.ev.date.localeCompare(b.ev.date))
    .slice(0, limit);
}
