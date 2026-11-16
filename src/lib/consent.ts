"use client";
import { useSyncExternalStore } from "react";

/**
 * Cookie consent. "all" allows optional analytics; "essential" doesn't.
 * Any future analytics script must check `hasAnalyticsConsent()` (or the
 * `useConsent()` hook) before loading.
 */
export type Consent = "all" | "essential";
type Snapshot = Consent | "undecided" | "unknown";

const KEY = "pathcross.consent.v1";
const listeners = new Set<() => void>();
let cache: Snapshot | null = null;

function read(): Snapshot {
  if (cache !== null) return cache;
  let next: Snapshot = "undecided";
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (v?.choice === "all" || v?.choice === "essential") next = v.choice;
  } catch {
    /* storage blocked: ask each visit, default to essential only */
  }
  cache = next;
  return next;
}

function write(next: Consent | "undecided") {
  cache = next;
  try {
    if (next === "undecided") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify({ choice: next, decidedAt: new Date().toISOString() }));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export const hasAnalyticsConsent = () => typeof window !== "undefined" && read() === "all";
export const setConsent = (c: Consent) => write(c);
/** Clears the choice so the banner shows again. */
export const reopenConsent = () => write("undecided");

/** "unknown" on the server and before hydration, so the banner never flashes for people who already chose. */
export function useConsent(): Snapshot {
  return useSyncExternalStore(subscribe, read, () => "unknown");
}
