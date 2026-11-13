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
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); go(q); }}
        className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-navy-100 sm:flex-row"
      >
        <label htmlFor="prompt" className="sr-only">What kind of networking are you looking for?</label>
        <input
          id="prompt"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What kind of networking are you looking for?"
          className="min-w-0 flex-1 rounded-xl px-4 py-3 text-base text-navy-900 outline-none placeholder:text-navy-500/70"
        />
        <button type="submit" className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700">
          Find events
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        {suggestions.map((s) => (
          <button key={s} onClick={() => go(s)} className="rounded-full border border-white/30 px-3 py-1 text-white/90 hover:bg-white/10">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
