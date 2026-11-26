import type { MetadataRoute } from "next";
import { clubs } from "@/lib/clubs";
import { getEvents } from "@/lib/data";
import { interests } from "@/lib/interests";
import { site } from "@/lib/site";

/** Every public page, for search engines. Events come and go, so this is rebuilt with the event list. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  // Only pages whose content really changes get a date, so Google can trust it.
  // Lists built from the live event feed change daily; clubs carry their own "checked" date.
  const now = new Date();
  const page = (path: string, changeFrequency: "daily" | "weekly" | "monthly", priority: number, lastModified?: Date) =>
    ({ url: `${site.url}${path}`, changeFrequency, priority, ...(lastModified ? { lastModified } : {}) });
  const live = (path: string, priority: number) => page(path, "daily", priority, now);
  const clubDate = (c: { pricing_as_of?: string }) => {
    const d = c.pricing_as_of ? new Date(c.pricing_as_of) : undefined;
    return d && !Number.isNaN(d.getTime()) ? d : undefined;
  };
  return [
    live("", 1),
    live("/events", 0.9),
    live("/top-10", 0.8),
    live("/this-week", 0.7),
    live("/calendar", 0.7),
    page("/clubs", "weekly", 0.8),
    page("/about", "monthly", 0.5),
    page("/submit", "monthly", 0.5),
    page("/faq", "monthly", 0.5),
    page("/contact", "monthly", 0.4),
    ...interests.map((i) => page(`/clubs/${i.id}`, "weekly", 0.7)),
    ...clubs.filter((c) => !c.pending).map((c) => page(`/clubs/${c.interest}/${c.id}`, "monthly", 0.6, clubDate(c))),
    // Repeating events live on /weekly; their own pages change date every week.
    live("/weekly", 0.8),
    ...events.filter((e) => !e.recurrence).map((e) => page(`/events/${e.id}`, "weekly", 0.6)),
    page("/privacy", "monthly", 0.2),
    page("/terms", "monthly", 0.2),
    page("/cookies", "monthly", 0.2),
  ];
}
