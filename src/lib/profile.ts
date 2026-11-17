/**
 * What a person tells us about themselves so the site can rank events for them.
 * Stored in the Supabase account (user metadata) when signed in, and in this
 * browser only when signed out. Used by src/lib/rating.ts.
 */
export const professions = [
  { id: "financial-advisor", label: "Financial advisor" },
  { id: "founder", label: "Founder / start-up owner" },
  { id: "business-owner", label: "Small business owner" },
  { id: "real-estate", label: "Real estate" },
  { id: "tech", label: "Tech / engineering" },
  { id: "sales", label: "Sales / business development" },
  { id: "legal", label: "Attorney / legal" },
  { id: "healthcare", label: "Healthcare" },
  { id: "creative", label: "Creative / marketing" },
  { id: "student", label: "Student / early career" },
  { id: "other", label: "Other profession" },
  { id: "social", label: "Just here for fun and friends" },
] as const;

export const goals = [
  { id: "network", label: "Build my professional network" },
  { id: "clients", label: "Grow my client base" },
  { id: "hnw", label: "Meet high-net-worth individuals" },
  { id: "founders", label: "Meet founders and investors" },
  { id: "career", label: "Find a job or career move" },
  { id: "learn", label: "Learn something new" },
  { id: "hobbies", label: "Get into more hobbies" },
  { id: "friends", label: "Make friends" },
  { id: "active", label: "Stay active" },
  { id: "service", label: "Give back to the community" },
] as const;

export type ProfessionId = (typeof professions)[number]["id"];
export type GoalId = (typeof goals)[number]["id"];

export interface Profile {
  profession?: ProfessionId;
  goals: GoalId[];
}

export const EMPTY_PROFILE: Profile = { goals: [] };

export const hasProfile = (p: Profile) => Boolean(p.profession) || p.goals.length > 0;
export const professionLabel = (id?: string) => professions.find((p) => p.id === id)?.label;
export const goalLabel = (id: string) => goals.find((g) => g.id === id)?.label;

/** Accepts anything (stored JSON, account metadata) and keeps only known values. */
export function parseProfile(v: unknown): Profile {
  const o = (v && typeof v === "object" ? v : {}) as { profession?: unknown; goals?: unknown };
  const profession = professions.find((p) => p.id === o.profession)?.id;
  const picked = Array.isArray(o.goals) ? o.goals : [];
  return { profession, goals: goals.map((g) => g.id).filter((id) => picked.includes(id)) };
}
