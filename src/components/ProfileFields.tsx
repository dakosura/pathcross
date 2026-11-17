"use client";
import { goals, professions, type GoalId, type ProfessionId, type Profile } from "@/lib/profile";

/** Profession picker and "what are you looking for" chips. Controlled. */
export function ProfileFields({ value, onChange, idPrefix = "profile" }: { value: Profile; onChange: (p: Profile) => void; idPrefix?: string }) {
  const toggle = (g: GoalId) =>
    onChange({ ...value, goals: value.goals.includes(g) ? value.goals.filter((x) => x !== g) : [...value.goals, g] });
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-profession`} className="block text-sm font-semibold text-ink">What do you do?</label>
        <select
          id={`${idPrefix}-profession`}
          value={value.profession ?? ""}
          onChange={(e) => onChange({ ...value, profession: (e.target.value || undefined) as ProfessionId | undefined })}
          className="mt-1.5 w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-moss"
        >
          <option value="">Choose one</option>
          {professions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold text-ink">What are you looking for? <span className="font-normal text-bark">Pick any.</span></legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {goals.map((g) => {
            const on = value.goals.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(g.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${on ? "bg-forest text-cream" : "bg-card text-bark ring-1 ring-line hover:bg-line"}`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
