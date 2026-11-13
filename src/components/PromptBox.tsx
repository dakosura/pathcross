"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const suggestions = ["Financial advisor mixers", "Startup founders", "Casual happy hours"];

export function PromptBox() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go(value: string) {
    router.push(value.trim() ? `/events?q=${encodeURIComponent(value.trim())}` : "/events");
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); go(q); }}
        className="flex flex-col gap-2 rounded-xl bg-card p-2 shadow-xl ring-1 ring-line focus-within:ring-2 focus-within:ring-clay-300 sm:flex-row"
      >
        <label htmlFor="prompt" className="sr-only">What kind of networking are you looking for?</label>
        <input
          id="prompt"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What kind of networking are you looking for?"
          className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm sm:text-base text-ink outline-none placeholder:text-bark/60"
        />
        <button type="submit" className="rounded-lg bg-clay px-6 py-3 font-semibold text-white hover:bg-clay-700">
          Find events
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-start gap-2 text-sm">
        {suggestions.map((s) => (
          <button key={s} onClick={() => go(s)} className="rounded-md border border-cream/25 px-3 py-1 text-cream/85 hover:bg-cream/10">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
