import type { Event } from "@/types";

/** Where "Sign up" should take someone: the registration page if known, else the organizer's listing. */
export function signupUrl(ev: Event): string | undefined {
  if (ev.placeholder) return undefined;
  const url = ev.registration_url ?? ev.source_url;
  return /^https?:\/\//.test(url) ? url : undefined;
}

/** "cochawaii.org", "meetup.com" */
export function hostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : host;
  } catch {
    return "organizer's site";
  }
}
