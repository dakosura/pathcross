"use client";
import Link from "next/link";
import { useState } from "react";
import { useNetwork } from "@/lib/network";
import { goalLabel, goals, professionLabel, professions, type GoalId, type ProfessionId } from "@/lib/profile";

/**
 * "Tell us what you do" as two short steps: what you do, then what you're after.
 * Every tap is saved straight away, so the Top 10, featured events and stars
 * re-rank as you go. `tone="dark"` is for the green hero panel.
 */
export function ProfileSteps({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { profile, saveProfile, error } = useNetwork();
  const [editing, setEditing] = useState<1 | 2 | null>(null);
  const dark = tone === "dark";
  const step = editing ?? (profile.profession ? "done" : 1);

  const text = dark ? "text-cream" : "text-ink";
  const muted = dark ? "text-cream/70" : "text-bark";
  const chip = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
      on ? (dark ? "bg-clay text-white" : "bg-forest text-cream") : dark ? "bg-cream/10 text-cream ring-1 ring-cream/25 hover:bg-cream/20" : "bg-card text-bark ring-1 ring-line hover:bg-line"
    }`;
  const link = dark ? "font-semibold text-clay-300 hover:text-white" : "font-semibold text-clay-700 hover:underline";

  const pickProfession = (id: ProfessionId) => { void saveProfile({ ...profile, profession: id }); setEditing(2); };
  const toggleGoal = (g: GoalId) => void saveProfile({ ...profile, goals: profile.goals.includes(g) ? profile.goals.filter((x) => x !== g) : [...profile.goals, g] });
  const [advisor, ...others] = professions;

  return (
    <div>
      {step === 1 && (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-clay-300" : "text-clay-700"}`}>Step 1 of 2</p>
          <h3 className={`mt-1 text-lg font-semibold ${text}`}>What do you do?</h3>
          <button
            type="button"
            onClick={() => pickProfession(advisor.id)}
            aria-pressed={profile.profession === advisor.id}
            className={`mt-3 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition ${dark ? "bg-clay text-white hover:bg-clay-700" : "bg-forest text-cream hover:bg-forest-700"}`}
          >
            <span>
              <span className="block font-semibold">I&apos;m a financial advisor</span>
              <span className="block text-xs opacity-80">Find the rooms where clients and referral partners gather</span>
            </span>
            <span aria-hidden="true" className="text-xl">→</span>
          </button>
          <p className={`mt-3 text-xs ${muted}`}>Or something else:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {others.map((p) => <button key={p.id} type="button" aria-pressed={profile.profession === p.id} onClick={() => pickProfession(p.id)} className={chip(profile.profession === p.id)}>{p.label}</button>)}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-clay-300" : "text-clay-700"}`}>Step 2 of 2</p>
          <h3 className={`mt-1 text-lg font-semibold ${text}`}>What are you after? <span className={`text-sm font-normal ${muted}`}>Pick any.</span></h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {goals.map((g) => <button key={g.id} type="button" aria-pressed={profile.goals.includes(g.id)} onClick={() => toggleGoal(g.id)} className={chip(profile.goals.includes(g.id))}>{g.label}</button>)}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button type="button" onClick={() => setEditing(null)} className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white hover:bg-clay-700">Show my events</button>
            <button type="button" onClick={() => setEditing(1)} className={`text-sm ${link}`}>← Back</button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div>
          <p className={`text-sm ${muted}`}>
            Ranked for a <span className={`font-semibold ${text}`}>{professionLabel(profile.profession)?.toLowerCase()}</span>
            {profile.goals.length > 0 ? <>. Your goals: <span className={`font-semibold ${text}`}>{profile.goals.slice(0, 2).map((g) => goalLabel(g)).join(" · ")}</span>{profile.goals.length > 2 ? ` (+${profile.goals.length - 2} more)` : ""}.</> : "."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/this-week" className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white hover:bg-clay-700">See my week</Link>
            <Link href="/top-10" className={`text-sm ${link}`}>My top 10</Link>
            <button type="button" onClick={() => setEditing(1)} className={`text-sm ${link}`}>Change answers</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-clay-300">{error}</p>}
    </div>
  );
}
