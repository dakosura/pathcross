import { adminEmails } from "@/lib/ops";
import { adminClient } from "@/lib/supabase-admin";

// Tells the browser whether the signed-in person is a site admin, so their own
// visits can be left out of the visit counter. Answers only true or false.
export async function GET(request: Request) {
  const json = (admin: boolean) => Response.json({ admin }, { headers: { "Cache-Control": "no-store" } });
  try {
    const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json(false);
    const { data, error } = await adminClient().auth.getUser(token);
    const email = data.user?.email?.toLowerCase();
    if (error || !email || !data.user?.email_confirmed_at) return json(false);
    return json(adminEmails().includes(email));
  } catch {
    return json(false);
  }
}
