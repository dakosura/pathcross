import type { Event } from "@/types";
import type { IngestedEvent } from "./types";

/**
 * Eventbrite's public search API was shut down in 2019, so this adapter only
 * reads organizations you are authorized on (their own events). Set
 * EVENTBRITE_TOKEN (private token / OAuth token for that account) and list
 * organization ids in sources.ts. See
 * https://www.eventbrite.com/platform/api#/reference/event/list/list-events-by-organization
 */
interface EbEvent {
  id: string;
  name: { text: string };
  description?: { text?: string | null };
  url: string;
  start: { local: string };
  end: { local: string };
  is_free?: boolean;
  venue?: { name?: string; latitude?: string; longitude?: string; address?: { localized_address_display?: string; city?: string } };
}

export async function fetchEventbriteOrg(
  orgId: string,
  token: string,
  opts: { organizer: string; category: Event["category"] },
): Promise<IngestedEvent[]> {
  const out: IngestedEvent[] = [];
  let continuation: string | undefined;
  for (let page = 0; page < 10; page++) {
    const qs = new URLSearchParams({ status: "live", order_by: "start_asc", expand: "venue" });
    if (continuation) qs.set("continuation", continuation);
    const res = await fetch(`https://www.eventbriteapi.com/v3/organizations/${orgId}/events/?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Eventbrite ${orgId}: HTTP ${res.status}`);
    const json = await res.json();
    for (const e of json.events as EbEvent[]) {
      const [date, st] = e.start.local.split("T");
      const [edate, et] = e.end.local.split("T");
      out.push({
        id: `eventbrite-${e.id}`,
        external_id: e.id,
        title: e.name.text,
        description: (e.description?.text ?? "").slice(0, 1500),
        date,
        start_time: st.slice(0, 5),
        end_time: edate === date ? et.slice(0, 5) : st.slice(0, 5),
        location: { venue: e.venue?.name ?? "See event listing", city: e.venue?.address?.city ?? "Honolulu" },
        address: e.venue?.address?.localized_address_display,
        organizer: opts.organizer,
        source_url: e.url,
        registration_url: e.url,
        price: e.is_free ? "Free" : undefined,
        city: "Honolulu",
        category: opts.category,
        lat: e.venue?.latitude ? Number(e.venue.latitude) : undefined,
        lng: e.venue?.longitude ? Number(e.venue.longitude) : undefined,
      });
    }
    if (!json.pagination?.has_more_items) break;
    continuation = json.pagination.continuation;
  }
  return out;
}
