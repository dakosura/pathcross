import { requireAdmin } from "@/lib/ops";
import { extractListing, findExisting, findExistingClub } from "@/lib/quick-add";

// Quick-add step 1: the owner pastes a link, caption text and/or a screenshot; Claude fills in a draft event to review.
export const maxDuration = 60;

export async function POST(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return admin.error;

    const raw = await request.text();
    if (raw.length > 4_000_000) return json({ error: "too-big", message: "That screenshot is too large." }, 413);
    const b = JSON.parse(raw) as { text?: unknown; link?: unknown; image?: { media_type?: unknown; data?: unknown }; kind?: unknown };
    const kind = b.kind === "event" || b.kind === "group" ? b.kind : undefined;
    const text = typeof b.text === "string" ? b.text.trim() : "";
    const link = typeof b.link === "string" ? b.link.trim() : "";
    const img = b.image && typeof b.image.data === "string" && typeof b.image.media_type === "string" && /^image\/(jpeg|png|webp|gif)$/.test(b.image.media_type) ? { media_type: b.image.media_type, data: b.image.data } : undefined;
    if (!text && !link && !img) return json({ error: "empty", message: "Paste a link, some text, or add a screenshot first." }, 422);

    // A link we already list is skipped before spending an AI call on it.
    if (link) {
      if (kind !== "group") {
        const dup = await findExisting([link]);
        if (dup) return json({ duplicate: dup });
      }
      if (kind !== "event") {
        const club = await findExistingClub(link).catch(() => null); // clubs table may not exist yet
        if (club) return json({ duplicateClub: club });
      }
    }

    const out = await extractListing({ text, link, image: img, kind });
    if (out.kind === "group") {
      const club = await findExistingClub("", out.club.name).catch(() => null);
      if (club || (out.club.url && (await findExistingClub(out.club.url).catch(() => null)))) return json({ duplicateClub: club ?? { name: out.club.name } });
      return json({ kind: "group", club: out.club });
    }
    return json({ kind: "event", draft: out.draft });
  } catch (err) {
    return json({ error: "server", message: err instanceof Error ? err.message : "Something went wrong." }, 500);
  }
}
