"use client";
import { useState } from "react";
import type { Event } from "@/types";
import { EventGrid } from "./EventGrid";

export function EventBrowser({ events, categories, initialQuery = "" }: { events: Event[]; categories: readonly string[]; initialQuery?: string }) {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState(initialQuery);

  const needle = q.trim().toLowerCase();
  const filtered = events.filter(
    (ev) =>
      (category === "All" || ev.category === category) &&
      (!needle || `${ev.title} ${ev.description} ${ev.organizer} ${ev.category} ${ev.location.venue}`.toLowerCase().includes(needle)),
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                category === c ? "bg-forest text-white" : "bg-sand text-bark hover:bg-line"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events…"
          aria-label="Search events"
          className="w-full rounded-md border border-line px-4 py-2 text-sm outline-none focus:border-moss md:w-64"
        />
      </div>
      <EventGrid events={filtered} />
    </div>
  );
}
