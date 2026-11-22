import { interests } from "./interests";

/** The listing request form (/submit): its options and the checks both the form and the server use. */
export const KINDS = [
  { id: "event", label: "An event" },
  { id: "group", label: "A club, group or network" },
  { id: "program", label: "A class or program" },
  { id: "other", label: "Something else" },
] as const;

export const REPEATS = ["One time", "Weekly", "Every other week", "Monthly", "Other"] as const;

export const INTEREST_OPTIONS = [...interests.map((i) => ({ id: i.id as string, label: i.name })), { id: "other", label: "Not sure / something else" }];

export type Kind = (typeof KINDS)[number]["id"];

export interface Submission {
  kind: Kind;
  name: string;
  organizer: string;
  interest: string;
  description: string;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  repeats: string | null;
  venue: string | null;
  address: string | null;
  price: string | null;
  website: string;
  social: string | null;
  join_info: string | null;
  extra: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const opt = (v: unknown, max: number) => { const s = str(v); return s ? s.slice(0, max) : null; };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A web address a visitor typed: adds https:// when missing and rejects anything that is not http(s). */
export function cleanUrl(raw: string): string | null {
  if (!raw) return null;
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withProto);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    return u.toString().slice(0, 400);
  } catch {
    return null;
  }
}

export function validateSubmission(raw: unknown): { ok: true; data: Submission } | { ok: false; errors: Record<string, string> } {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const kind = KINDS.find((k) => k.id === b.kind)?.id;
  if (!kind) errors.kind = "Choose what you'd like to list.";
  const name = str(b.name).slice(0, 160);
  if (name.length < 2) errors.name = "Give it a name.";
  const organizer = str(b.organizer).slice(0, 160);
  if (organizer.length < 2) errors.organizer = "Tell us who runs it.";
  const interest = INTEREST_OPTIONS.find((i) => i.id === b.interest)?.id;
  if (!interest) errors.interest = "Pick the closest category.";
  const description = str(b.description).slice(0, 1500);
  if (description.length < 30) errors.description = "A couple of sentences, please (at least 30 characters).";
  const website = cleanUrl(str(b.website));
  if (!website) errors.website = "Add a web address people can use to learn more or sign up.";
  const social = str(b.social) ? cleanUrl(str(b.social)) : null;
  if (str(b.social) && !social) errors.social = "That doesn't look like a web address.";
  const contact_name = str(b.contact_name).slice(0, 160);
  if (contact_name.length < 2) errors.contact_name = "Tell us who to contact.";
  const contact_email = str(b.contact_email).slice(0, 254).toLowerCase();
  if (!EMAIL.test(contact_email)) errors.contact_email = "Enter an email address we can reach you at.";
  if (b.consent !== true) errors.consent = "Please confirm this to send your request.";

  const event_date = str(b.event_date);
  if (event_date && !/^\d{4}-\d{2}-\d{2}$/.test(event_date)) errors.event_date = "Pick a date.";
  const time = (v: unknown) => { const s = str(v); return /^[0-2]\d:[0-5]\d$/.test(s) ? s : null; };
  const repeats = str(b.repeats);
  if (kind === "event" && !event_date && (!repeats || repeats === "One time")) errors.event_date = "Add the date, or choose how often it repeats.";

  if (Object.keys(errors).length || !kind || !interest || !website) return { ok: false, errors };
  return {
    ok: true,
    data: {
      kind, name, organizer, interest, description,
      event_date: event_date || null, start_time: time(b.start_time), end_time: time(b.end_time),
      repeats: opt(b.repeats, 200), venue: opt(b.venue, 200), address: opt(b.address, 300), price: opt(b.price, 200),
      website, social, join_info: opt(b.join_info, 800), extra: opt(b.extra, 1500),
      contact_name, contact_email, contact_phone: opt(b.contact_phone, 60),
    },
  };
}
