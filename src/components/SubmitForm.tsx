"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { INTEREST_OPTIONS, KINDS, REPEATS, type Kind } from "@/lib/submissions";
import { site } from "@/lib/site";

const input = "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-moss";
const label = "block text-sm font-semibold text-ink";
const hint = "mt-1 text-xs text-bark";

const EMPTY = {
  kind: "" as Kind | "", name: "", organizer: "", interest: "", description: "",
  event_date: "", start_time: "", end_time: "", repeats: "One time", venue: "", address: "", price: "",
  website: "", social: "", join_info: "", extra: "", contact_name: "", contact_email: "", contact_phone: "",
  consent: false, hp: "",
};

function Field({ id, title, error, note, children }: { id: string; title: string; error?: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      {children}
      {note && !error && <p className={hint}>{note}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-clay-700">{error}</p>}
    </div>
  );
}

/** The listing request questionnaire. Sends to /api/submit; the site owner sees requests on /ops. */
export function SubmitForm() {
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"idle" | "sending" | "done" | "failed">("idle");
  // When the form appeared, so instant bot submissions can be spotted. Set after load, not while rendering.
  const opened = useRef(0);
  useEffect(() => { opened.current = Date.now(); }, []);

  const set = <K extends keyof typeof EMPTY>(k: K, val: (typeof EMPTY)[K]) => setV((p) => ({ ...p, [k]: val }));
  const isEvent = v.kind === "event" || v.kind === "program";
  const oneTime = v.repeats === "One time";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhase("sending");
    setErrors({});
    try {
      const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, ts: opened.current }) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return setPhase("done");
      if (res.status === 422 && body.errors) { setErrors(body.errors); setPhase("idle"); document.getElementById("submit-top")?.scrollIntoView({ behavior: "smooth" }); return; }
      setPhase("failed");
    } catch {
      setPhase("failed");
    }
  }

  if (phase === "done") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">Request received</p>
        <h2 className="mt-2 text-2xl font-semibold">Thank you. We&apos;ve got it.</h2>
        <p className="mx-auto mt-3 max-w-md text-bark">We review every request before anything is listed. If we need more detail, we&apos;ll email <strong>{v.contact_email}</strong>. Questions in the meantime: <a href={`mailto:${site.contactEmail}`} className="font-semibold text-clay-700 hover:underline">{site.contactEmail}</a>.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/events" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700">Browse events</Link>
          <button type="button" onClick={() => { setV(EMPTY); setPhase("idle"); }} className="rounded-full px-5 py-2.5 text-sm font-semibold text-forest ring-1 ring-forest/25 hover:bg-moss-50">Add another</button>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  return (
    <form onSubmit={submit} noValidate className="space-y-8" aria-describedby="submit-top">
      <span id="submit-top" />
      {Object.keys(errors).length > 0 && <p role="alert" className="rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">Please fix the highlighted items below.</p>}

      <fieldset className="space-y-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
        <legend className="px-1 text-lg font-semibold">1. What are you listing?</legend>
        <div>
          <p className={label}>I&apos;d like to list…</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="What you are listing">
            {KINDS.map((k) => (
              <button key={k.id} type="button" role="radio" aria-checked={v.kind === k.id} onClick={() => set("kind", k.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${v.kind === k.id ? "bg-forest text-cream" : "bg-white text-bark ring-1 ring-line hover:bg-line"}`}>{k.label}</button>
            ))}
          </div>
          {err("kind") && <p role="alert" className="mt-1 text-xs font-medium text-clay-700">{err("kind")}</p>}
        </div>
        <Field id="f-name" title="Name" error={err("name")} note="The name people will search for.">
          <input id="f-name" value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={160} className={input} />
        </Field>
        <Field id="f-org" title="Who runs it?" error={err("organizer")} note="Your company, organization or name.">
          <input id="f-org" value={v.organizer} onChange={(e) => set("organizer", e.target.value)} maxLength={160} className={input} />
        </Field>
        <Field id="f-interest" title="Closest category" error={err("interest")}>
          <select id="f-interest" value={v.interest} onChange={(e) => set("interest", e.target.value)} className={input}>
            <option value="">Choose one</option>
            {INTEREST_OPTIONS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </Field>
        <Field id="f-desc" title="Description" error={err("description")} note="What happens, who it's for and why someone should come. A few sentences is plenty.">
          <textarea id="f-desc" value={v.description} onChange={(e) => set("description", e.target.value)} rows={5} maxLength={1500} className={input} />
        </Field>
      </fieldset>

      {v.kind && (
        <fieldset className="space-y-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <legend className="px-1 text-lg font-semibold">2. {isEvent ? "When and where" : "Where and how to join"}</legend>
          {isEvent && (
            <>
              <Field id="f-repeats" title="How often?">
                <select id="f-repeats" value={v.repeats} onChange={(e) => set("repeats", e.target.value)} className={input}>
                  {REPEATS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="f-date" title={oneTime ? "Date" : "Next date (if known)"} error={err("event_date")}>
                  <input id="f-date" type="date" value={v.event_date} onChange={(e) => set("event_date", e.target.value)} className={input} />
                </Field>
                <Field id="f-start" title="Starts">
                  <input id="f-start" type="time" value={v.start_time} onChange={(e) => set("start_time", e.target.value)} className={input} />
                </Field>
                <Field id="f-end" title="Ends">
                  <input id="f-end" type="time" value={v.end_time} onChange={(e) => set("end_time", e.target.value)} className={input} />
                </Field>
              </div>
              {!oneTime && <p className={hint}>Tell us the usual day and time in the description or the notes at the end, for example &ldquo;every Thursday 12:30 to 1:30 PM&rdquo;.</p>}
            </>
          )}
          <Field id="f-venue" title="Venue or meeting place" note="Or write Online, or Honolulu + online.">
            <input id="f-venue" value={v.venue} onChange={(e) => set("venue", e.target.value)} maxLength={200} className={input} />
          </Field>
          <Field id="f-address" title="Street address" note="So we can put it on the map. Leave blank if it's online or varies.">
            <input id="f-address" value={v.address} onChange={(e) => set("address", e.target.value)} maxLength={300} className={input} />
          </Field>
          <Field id="f-price" title={isEvent ? "Price" : "Cost to join"} note="For example Free, $25, or dues posted on your site. Leave blank if unsure.">
            <input id="f-price" value={v.price} onChange={(e) => set("price", e.target.value)} maxLength={200} className={input} />
          </Field>
          <Field id="f-join" title="Who is it for, and how do people join or sign up?" error={err("join_info")}>
            <textarea id="f-join" value={v.join_info} onChange={(e) => set("join_info", e.target.value)} rows={3} maxLength={800} className={input} />
          </Field>
        </fieldset>
      )}

      <fieldset className="space-y-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
        <legend className="px-1 text-lg font-semibold">{v.kind ? "3" : "2"}. Links</legend>
        <Field id="f-web" title="Website or sign-up link" error={err("website")} note="Where people go to learn more or register. We link to it from your listing.">
          <input id="f-web" type="text" inputMode="url" value={v.website} onChange={(e) => set("website", e.target.value)} maxLength={400} placeholder="www.example.com" className={input} />
        </Field>
        <Field id="f-social" title="Social media page (optional)" error={err("social")}>
          <input id="f-social" type="text" inputMode="url" value={v.social} onChange={(e) => set("social", e.target.value)} maxLength={400} className={input} />
        </Field>
        <Field id="f-extra" title="Anything else we should know? (optional)" note="Capacity, dress code, age limits, a flyer link, or the usual schedule for repeating events.">
          <textarea id="f-extra" value={v.extra} onChange={(e) => set("extra", e.target.value)} rows={3} maxLength={1500} className={input} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-line bg-card p-5 sm:p-6">
        <legend className="px-1 text-lg font-semibold">{v.kind ? "4" : "3"}. How can we reach you?</legend>
        <p className="text-sm text-bark">Only the PathCross owner sees these. We use them to follow up about your request, and never publish them.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-cname" title="Your name" error={err("contact_name")}>
            <input id="f-cname" autoComplete="name" value={v.contact_name} onChange={(e) => set("contact_name", e.target.value)} maxLength={160} className={input} />
          </Field>
          <Field id="f-cemail" title="Your email" error={err("contact_email")}>
            <input id="f-cemail" type="email" autoComplete="email" value={v.contact_email} onChange={(e) => set("contact_email", e.target.value)} maxLength={254} className={input} />
          </Field>
        </div>
        <Field id="f-cphone" title="Phone (optional)">
          <input id="f-cphone" type="tel" autoComplete="tel" value={v.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} maxLength={60} className={input} />
        </Field>

        {/* A field real visitors never see; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={v.hp} onChange={(e) => set("hp", e.target.value)} /></label>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-bark">
            <input type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#c17f4a]" />
            <span>I run this, or I&apos;m allowed to submit it. I understand PathCross reviews every request, may edit it for length and clarity, and may decline it. I&apos;ve read the <Link href="/privacy" className="font-semibold text-clay-700 hover:underline">privacy notice</Link> and <Link href="/terms" className="font-semibold text-clay-700 hover:underline">terms</Link>.</span>
          </label>
          {err("consent") && <p role="alert" className="mt-1 text-xs font-medium text-clay-700">{err("consent")}</p>}
        </div>
      </fieldset>

      {phase === "failed" && (
        <p role="alert" className="rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">
          We couldn&apos;t send that just now. Please try again, or email the details to <a href={`mailto:${site.contactEmail}`} className="underline">{site.contactEmail}</a>.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={phase === "sending"} className="rounded-full bg-clay px-7 py-3 font-semibold text-white transition hover:bg-clay-700 disabled:opacity-60">{phase === "sending" ? "Sending…" : "Send my request"}</button>
        <p className="text-sm text-bark">Prefer email? <a href={`mailto:${site.contactEmail}?subject=${encodeURIComponent("Listing request")}`} className="font-semibold text-clay-700 hover:underline">{site.contactEmail}</a></p>
      </div>
    </form>
  );
}
