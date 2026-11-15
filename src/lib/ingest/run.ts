import { createClient } from "@supabase/supabase-js";
import type { IngestedEvent } from "./types";
import { parseIcs } from "./ics";
import { fetchEventbriteOrg } from "./eventbrite";
import { sources, type Source } from "./sources";

export interface SourceReport { source: string; fetched: number; inserted: number; updated: number; removed: number; error?: string }

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchSource(s: Source): Promise<IngestedEvent[]> {
  if (s.type === "ics") {
    const res = await fetch(s.url, { headers: { "User-Agent": "PathCrossBot/1.0 (event aggregator)" }, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseIcs(await res.text(), s);
  }
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) throw new Error("EVENTBRITE_TOKEN not set");
  return fetchEventbriteOrg(s.orgId, token, s);
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Honolulu" });

function row(e: IngestedEvent, source: string) {
  return {
    id: e.id, external_id: e.external_id, source,
    title: e.title, description: e.description, date: e.date,
    start_time: e.start_time, end_time: e.end_time,
    venue: e.location.venue, city: e.city, address: e.address ?? null,
    organizer: e.organizer, source_url: e.source_url,
    registration_url: e.registration_url ?? null, price: e.price ?? null,
    lat: e.lat ?? null, lng: e.lng ?? null,
    status: "active", last_seen: new Date().toISOString(),
  };
}

export async function runIngest(): Promise<SourceReport[]> {
  const db = admin();
  const reports: SourceReport[] = [];
  const cutoff = today();

  for (const s of sources) {
    const report: SourceReport = { source: s.key, fetched: 0, inserted: 0, updated: 0, removed: 0 };
    try {
      // Only upcoming events; past ones are left untouched.
      const events = (await fetchSource(s)).filter((e) => e.date >= cutoff);
      report.fetched = events.length;

      const ids = events.map((e) => e.id);
      const { data: existing, error: selErr } = await db.from("events").select("id").in("id", ids.length ? ids : ["-"]);
      if (selErr) throw selErr;
      const have = new Set((existing ?? []).map((r) => r.id as string));

      // New rows get the adapter's category; existing rows keep any manual
      // category/featured edits (those columns are not in the update payload).
      const fresh = events.filter((e) => !have.has(e.id)).map((e) => ({ ...row(e, s.key), category: e.category }));
      if (fresh.length) {
        const { error } = await db.from("events").insert(fresh);
        if (error) throw error;
      }
      report.inserted = fresh.length;

      for (const e of events.filter((e) => have.has(e.id))) {
        const { error } = await db.from("events").update(row(e, s.key)).eq("id", e.id);
        if (error) throw error;
        report.updated++;
      }

      // Upcoming events from this source that vanished from a non-empty feed => removed.
      if (events.length) {
        const { data: gone, error } = await db
          .from("events").update({ status: "removed" })
          .eq("source", s.key).eq("status", "active").gte("date", cutoff)
          .not("id", "in", `(${ids.map((i) => `"${i}"`).join(",")})`)
          .select("id");
        if (error) throw error;
        report.removed = gone?.length ?? 0;
      }
    } catch (err) {
      report.error = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    }
    reports.push(report);
  }
  return reports;
}
