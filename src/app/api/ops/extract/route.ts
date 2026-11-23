import { requireAdmin } from "@/lib/ops";
import { extractEvent } from "@/lib/quick-add";

// Quick-add step 1: the owner pastes a link, caption text and/or a screenshot; Claude fills in a draft event to review.
export const maxDuration = 60;

export async function POST(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return admin.error;

    const raw = await request.text();
    if (raw.length > 4_000_000) return json({ error: "too-big", message: "That screenshot is too large." }, 413);
    const b = JSON.parse(raw) as { text?: unknown; link?: unknown; image?: { media_type?: unknown; data?: unknown } };
    const text = typeof b.text === "string" ? b.text.trim() : "";
    const link = typeof b.link === "string" ? b.link.trim() : "";
    const img = b.image && typeof b.image.data === "string" && typeof b.image.media_type === "string" && /^image\/(jpeg|png|webp|gif)$/.test(b.image.media_type) ? { media_type: b.image.media_type, data: b.image.data } : undefined;
    if (!text && !link && !img) return json({ error: "empty", message: "Paste a link, some text, or add a screenshot first." }, 422);

    return json({ draft: await extractEvent({ text, link, image: img }) });
  } catch (err) {
    return json({ error: "server", message: err instanceof Error ? err.message : "Something went wrong." }, 500);
  }
}
