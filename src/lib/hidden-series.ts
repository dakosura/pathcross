"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Repeating events (farmers markets, run clubs, volunteer shifts) a visitor has
 * chosen to hide from the calendar. Kept in this browser only; nothing is sent
 * anywhere, and clearing the list brings them all back.
 */
const KEY = "pathcross.hiddenSeries.v1";
const EMPTY: readonly string[] = [];

let cache: readonly string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(v)) cache = v.filter((x): x is string => typeof x === "string");
  } catch {
    /* storage blocked or unreadable: start with nothing hidden */
  }
}

function write(next: readonly string[]) {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage blocked: lasts until the page closes */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    cache = EMPTY;
    load();
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

export function useHiddenSeries() {
  const hidden = useSyncExternalStore(subscribe, () => cache, () => EMPTY);
  const hide = useCallback((id: string) => { if (!cache.includes(id)) write([...cache, id]); }, []);
  const show = useCallback((id: string) => write(cache.filter((x) => x !== id)), []);
  const showAll = useCallback(() => write([]), []);
  return { hidden, hide, show, showAll };
}
