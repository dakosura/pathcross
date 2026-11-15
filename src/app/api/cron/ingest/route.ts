import { revalidateTag } from "next/cache";
import { runIngest } from "@/lib/ingest/run";

// Called daily by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const reports = await runIngest();
    revalidateTag("events", "max");
    return Response.json({ ok: !reports.some((r) => r.error), reports });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
