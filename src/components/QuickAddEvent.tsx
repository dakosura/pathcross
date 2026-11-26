"use client";
import { useState } from "react";

const CATEGORIES = ["General Professional", "Tech", "Startup", "Finance", "Real Estate", "Community", "Food & Drink", "Fitness", "Sports", "Volunteer"];

interface Draft { title: string; date: string; start_time: string; end_time: string; venue: string; address: string; organizer: string; description: string; price: string; category: string; source_url: string; registration_url: string }
const BLANK: Draft = { title: "", date: "", start_time: "", end_time: "", venue: "", address: "", organizer: "", description: "", price: "", category: "General Professional", source_url: "", registration_url: "" };

const input = "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss";

/** Shrinks a phone screenshot so it stays well under the upload limit. */
function shrink(file: File): Promise<{ media_type: string; data: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const url = c.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(src);
      resolve({ media_type: "image/jpeg", data: url.split(",")[1], preview: url });
    };
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = src;
  });
}

export function QuickAddEvent({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ media_type: string; data: string; preview: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<"read" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const call = async (path: string, body: unknown) => {
    const res = await fetch(path, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.message ?? (out.error === "signed-out" ? "Your sign-in expired. Reload the page." : "Something went wrong."));
    return out;
  };

  /** The event is already listed: nothing is added, the form is cleared. */
  const skip = (d: { title: string; date: string }) => {
    setDone(`Already listed: "${d.title}" (${d.date}). Nothing was added.`);
    setDraft(null); setLink(""); setText(""); setImage(null);
  };

  const readIt = async () => {
    setError(null); setDone(null); setBusy("read");
    try {
      const out = await call("/api/ops/extract", { link, text, image: image ? { media_type: image.media_type, data: image.data } : undefined });
      if (out.duplicate) { skip(out.duplicate); return; }
      setDraft({ ...BLANK, ...out.draft });
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(null); }
  };

  const save = async () => {
    if (!draft) return;
    setError(null); setBusy("save");
    try {
      const out = await call("/api/ops/events", draft);
      if (out.duplicate) { skip(out.duplicate); return; }
      setDone(`Added "${draft.title}". It's on the calendar now.`);
      setDraft(null); setLink(""); setText(""); setImage(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(null); }
  };

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft((d) => (d ? { ...d, [k]: e.target.value } : d));
  const field = (label: string, k: keyof Draft, type = "text") => (
    <label className="block text-sm font-semibold text-ink">{label}
      <input type={type} value={draft![k]} onChange={set(k)} className={`${input} mt-1 font-normal`} />
    </label>
  );

  return (
    <section className="mt-8 rounded-2xl border border-line bg-card">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <span><span className="block text-lg font-semibold">Quick add an event</span><span className="text-sm text-bark">Paste a link, caption or screenshot and review what gets filled in</span></span>
        <span className="text-xl text-bark" aria-hidden>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-line px-5 py-5">
          {done && <p role="status" className="rounded-xl bg-moss-50 px-4 py-3 text-sm font-medium text-forest">{done}</p>}
          {error && <p role="alert" className="rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">{error}</p>}

          {!draft ? (
            <>
              <label className="block text-sm font-semibold text-ink">Event link (optional)
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" className={`${input} mt-1 font-normal`} />
              </label>
              <label className="block text-sm font-semibold text-ink">Caption or text (optional)
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Paste the post caption or event details" className={`${input} mt-1 font-normal`} />
              </label>
              <div className="text-sm font-semibold text-ink">Screenshot or flyer (optional)
                <input type="file" accept="image/*" className="mt-1 block text-sm font-normal" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return setImage(null);
                  try { setImage(await shrink(f)); } catch (err) { setError(err instanceof Error ? err.message : "Couldn't read that image."); }
                }} />
                {image && <img src={image.preview} alt="Selected screenshot" className="mt-2 max-h-48 rounded-xl border border-line" />}
              </div>
              <button onClick={() => void readIt()} disabled={busy !== null || (!link.trim() && !text.trim() && !image)} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700 disabled:opacity-50">
                {busy === "read" ? "Reading…" : "Fill it in"}
              </button>
              <p className="text-xs text-bark">Instagram, Facebook and LinkedIn links usually can&apos;t be read automatically. For those, paste the caption or add a screenshot.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-bark">Check each field, fix anything that&apos;s off, then add it. Nothing is saved until you press Add.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">{field("Title", "title")}</div>
                {field("Date", "date", "date")}
                <label className="block text-sm font-semibold text-ink">Category
                  <select value={draft.category} onChange={set("category")} className={`${input} mt-1 font-normal`}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                {field("Starts", "start_time", "time")}
                {field("Ends", "end_time", "time")}
                {field("Venue", "venue")}
                {field("Address", "address")}
                {field("Organizer", "organizer")}
                {field("Price", "price")}
                <div className="sm:col-span-2">{field("Event link (required)", "source_url", "url")}</div>
                <div className="sm:col-span-2">{field("Sign-up link (if different)", "registration_url", "url")}</div>
                <label className="block text-sm font-semibold text-ink sm:col-span-2">About
                  <textarea value={draft.description} onChange={set("description")} rows={3} className={`${input} mt-1 font-normal`} />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => void save()} disabled={busy !== null} className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700 disabled:opacity-50">{busy === "save" ? "Adding…" : "Add event"}</button>
                <button onClick={() => { setDraft(null); setError(null); }} disabled={busy !== null} className="rounded-full px-4 py-2.5 text-sm font-semibold text-clay-700 hover:underline">Start over</button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
