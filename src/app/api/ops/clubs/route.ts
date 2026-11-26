import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/ops";
import { cleanClub, clubId, findExistingClub, validateClub } from "@/lib/quick-add";
import { adminClient } from "@/lib/supabase-admin";

// Quick-add step 2 for a group or club: saves the reviewed listing to the clubs table.
export async function POST(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return admin.error;

    const d = cleanClub(await request.json());
    const problem = validateClub(d);
    if (problem) return json({ error: "invalid", message: problem }, 422);

    // Already listed (same website, or same name)? Ignore it and say so.
    const dup = await findExistingClub(d.url, d.name);
    if (dup) return json({ duplicateClub: dup });

    const id = clubId(d);
    const { error } = await adminClient().from("clubs").insert({
      id, source: "manual", status: "active", name: d.name, interest: d.interest, blurb: d.blurb, url: d.url,
      area: d.area, address: d.address || null, membership: d.membership || null, phone: d.phone || null,
    });
    if (error?.code === "23505") return json({ duplicateClub: { id, name: d.name } }); // same generated id = same name
    if (error) throw error;
    revalidateTag("clubs", { expire: 0 }); // show the new club on the very next page load
    return json({ ok: true, id, interest: d.interest });
  } catch (err) {
    return json({ error: "server", message: err instanceof Error ? err.message : "Something went wrong." }, 500);
  }
}
