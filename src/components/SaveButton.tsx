"use client";
import { useNetwork, type NetworkKind } from "@/lib/network";

/** Adds or removes an event or club from the visitor's My Network map. */
export function SaveButton({ kind, id, size = "sm" }: { kind: NetworkKind; id: string; size?: "sm" | "lg" }) {
  const { has, toggle } = useNetwork();
  const on = has(kind, id);
  const sizing = size === "lg" ? "w-full justify-center px-4 py-3 text-sm" : "px-3 py-1.5 text-xs";
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggle(kind, id)}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-full font-semibold transition ${sizing} ${
        on ? "bg-forest text-cream hover:bg-forest-700" : "bg-transparent text-forest ring-1 ring-forest/25 hover:bg-moss-50"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={on ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"} />
      </svg>
      {on ? "In My Network" : "Add to My Network"}
    </button>
  );
}
