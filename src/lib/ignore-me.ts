"use client";

/**
 * "Don't count my visits": a flag kept in this browser only. The visit counter
 * (PageViewTracker) does nothing while it is set. It switches on by itself when
 * an admin signs in on a browser (see network.ts) and can be switched off on /ops.
 */
const KEY = "pathcross.ignoreMyVisits";

export function isIgnored(): boolean {
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setIgnored(on: boolean) {
  try {
    if (on) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch { /* storage blocked: the flag just doesn't stick */ }
}
