"use client";
import { useEffect } from "react";

/**
 * Steps through `items` on a timer: after `ms` on one item, `set` is called with the next.
 * Choosing an item by hand restarts the wait, because `current` changes. Does nothing for
 * people who ask their device for reduced motion, so content never changes by itself for them.
 */
export function useCycle<T extends { id: string }>(active: boolean, items: T[], current: T, set: (item: T) => void, ms = 10_000) {
  useEffect(() => {
    if (!active || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const i = items.findIndex((x) => x.id === current.id);
    const t = window.setTimeout(() => set(items[(i + 1) % items.length]), ms);
    return () => window.clearTimeout(t);
  }, [active, items, current, set, ms]);
}
