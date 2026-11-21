"use client";
import { useNetwork } from "@/lib/network";

/** "I'm going": adds the event to My Network and marks it as one the person is attending. */
export function GoingButton({ id, size = "sm" }: { id: string; size?: "sm" | "lg" }) {
  const { isGoing, toggleGoing } = useNetwork();
  const on = isGoing(id);
  const sizing = size === "lg" ? "w-full justify-center px-4 py-3 text-sm" : "px-3 py-1.5 text-xs";
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggleGoing(id)}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-full font-semibold transition ${sizing} ${on ? "bg-clay text-white hover:bg-clay-700" : "bg-transparent text-clay-700 ring-1 ring-clay/40 hover:bg-clay-50"}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={on ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"} />
      </svg>
      {on ? "You're going" : "I'm going"}
    </button>
  );
}
