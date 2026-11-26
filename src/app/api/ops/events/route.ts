import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/ops";
import { cleanDraft, eventId, findExisting, validateDraft } from "@/lib/quick-add";
import { adminClient } from "@/lib/supabase-admin";

// Quick-add step 2: saves the reviewed event. Imports never touch rows whose source is "manual".
export async function POST(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return admin.error;

    const d = cleanDraft(await request.json());
    const problem = validateDraft(d);
    if (problem) return json({ error: "invalid", message: problem }, 422);

    // Already listed (same link, or same title on the same day)? Ignore it and say so.
    const dup = await findExisting([d.source_url, d.registration_url], d.title, d.date);
    if (dup) return json({ duplicate: dup });

    const id = eventId(d);
    const { error } = await adminClient().from("events").upsert({
      id, source: "manual", external_id: id, status: "active", last_seen: new Date().toISOString(),
      title: d.title, description: d.description, date: d.date, start_time: d.start_time, end_time: d.end_time,
      venue: d.venue || "See event listing", city: "Honolulu", address: d.address || null, organizer: d.organizer,
      source_url: d.source_url, registration_url: d.registration_url || null, price: d.price || null, category: d.category,
    });
    if (error) throw error;
    revalidateTag("events", { expire: 0 }); // show the new event on the very next page load
    return json({ ok: true, id });
  } catch (err) {
    return json({ error: "server", message: err instanceof Error ? err.message : "Something went wrong." }, 500);
  }
}
