"use client";
import Link from "next/link";
import { useState } from "react";
import type { Event } from "@/types";
import { formatDate } from "@/lib/format";
import { useNetwork, type FeedbackAnswer } from "@/lib/network";
import { rateEvent } from "@/lib/rating";

const ANSWERS: { id: FeedbackAnswer; label: string }[] = [
  { id: "too_high", label: "Too high" },
  { id: "about_right", label: "About right" },
  { id: "too_low", label: "Too low" },
];

function Past({ event }: { event: Event }) {
  const { saved, notes, feedback, profile, setAttended, saveNote, setFeedback } = useNetwork();
  const went = saved.attended.includes(event.id);
  const [draft, setDraft] = useState(notes[event.id] ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const stars = rateEvent(event, profile).stars;

  async function save() {
    setState("saving");
    setState((await saveNote(event.id, draft)) ? "saved" : "idle");
  }

  return (
    <li className="rounded-xl border border-line bg-white/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-bark/80">{formatDate(event.date, { weekday: "short", month: "short", day: "numeric" })}</p>
      <Link href={`/events/${event.id}`} className="mt-0.5 block text-sm font-semibold leading-snug text-ink hover:text-clay-700">{event.title}</Link>

      <button type="button" aria-pressed={went} onClick={() => setAttended(event.id, !went)} className={`mt-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${went ? "bg-forest text-cream" : "text-forest ring-1 ring-forest/25 hover:bg-moss-50"}`}>
        {went ? "✓ I went" : "I went"}
      </button>

      {went && (
        <div className="mt-3">
          <label htmlFor={`note-${event.id}`} className="block text-xs font-semibold text-ink">Who did you meet? Follow-ups? <span className="font-normal text-bark">Private. Only you can see this.</span></label>
          <textarea id={`note-${event.id}`} value={draft} onChange={(e) => { setDraft(e.target.value); setState("idle"); }} maxLength={2000} rows={3} className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-moss" placeholder="Names, what you talked about, who to email…" />
          <button type="button" onClick={save} disabled={state === "saving"} className="mt-1.5 rounded-full bg-clay px-4 py-1.5 text-xs font-semibold text-white hover:bg-clay-700 disabled:opacity-60">
            {state === "saved" ? "Saved ✓" : state === "saving" ? "Saving…" : "Save note"}
          </button>
        </div>
      )}

      <div className="mt-3 border-t border-line pt-3">
        <p className="text-xs font-semibold text-ink">Was the networking rating accurate? <span className="font-normal text-bark">We showed {stars} {stars === 1 ? "star" : "stars"}.</span></p>
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Rating accuracy">
          {ANSWERS.map((a) => (
            <button key={a.id} type="button" aria-pressed={feedback[event.id] === a.id} onClick={() => setFeedback(event.id, a.id, stars)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${feedback[event.id] === a.id ? "bg-forest text-cream" : "bg-card text-bark ring-1 ring-line hover:bg-line"}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}

/** Events in My Network that have already happened: mark attended, jot private notes, and say whether the rating was right. */
export function FollowUp({ past }: { past: Event[] }) {
  const { saved } = useNetwork();
  const mine = past.filter((e) => saved.events.includes(e.id));
  return (
    <section aria-label="Past events" className="px-3 pb-3">
      <h2 className="px-2 pb-2 pt-3 font-sans text-[11px] font-bold uppercase tracking-widest text-bark/70">Past events: how did it go?</h2>
      {mine.length === 0 ? (
        <p className="rounded-xl bg-sand px-4 py-4 text-sm text-bark">After an event you&apos;ve added has happened, it shows up here so you can note who you met.</p>
      ) : (
        <ul className="space-y-2">{mine.map((e) => <Past key={e.id} event={e} />)}</ul>
      )}
    </section>
  );
}
