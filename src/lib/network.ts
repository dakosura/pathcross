"use client";
import { useSyncExternalStore } from "react";

/** "My Network" picks. Kept in this browser only (localStorage); there are no accounts yet. */
export interface SavedNetwork { events: string[]; clubs: string[] }

const KEY = "pathcross.network.v1";
const EMPTY: SavedNetwork = { events: [], clubs: [] };
let cache: SavedNetwork = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function read(): SavedNetwork {
  if (!loaded) {
    loaded = true;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        cache = { events: strings(p?.events), clubs: strings(p?.clubs) };
      }
    } catch {
      /* storage blocked: stay in memory */
    }
  }
  return cache;
}

function write(next: SavedNetwork) {
  cache = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) { loaded = false; cb(); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

export type NetworkKind = "events" | "clubs";

export function useNetwork() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    saved,
    has: (kind: NetworkKind, id: string) => saved[kind].includes(id),
    toggle: (kind: NetworkKind, id: string) => {
      const cur = read();
      const list = cur[kind];
      write({ ...cur, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] });
    },
    clear: () => write(EMPTY),
  };
}
