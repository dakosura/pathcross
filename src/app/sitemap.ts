import type { MetadataRoute } from "next";
import { clubs } from "@/lib/clubs";
import { getEvents } from "@/lib/data";
import { interests } from "@/lib/interests";
import { site } from "@/lib/site";

/** Every public page, for search engines. Events come and go, so this is rebuilt with the event list. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  const page = (path: string, changeFrequency: "daily" | "weekly" | "monthly", priority: number) => ({ url: `${site.url}${path}`, changeFrequency, priority });
  return [
    page("", "daily", 1),
    page("/events", "daily", 0.9),
    page("/top-10", "daily", 0.8),
    page("/this-week", "daily", 0.7),
    page("/calendar", "daily", 0.7),
    page("/clubs", "weekly", 0.8),
    page("/about", "monthly", 0.5),
    page("/submit", "monthly", 0.5),
    page("/faq", "monthly", 0.5),
    page("/contact", "monthly", 0.4),
    ...interests.map((i) => page(`/clubs/${i.id}`, "weekly", 0.7)),
    ...clubs.filter((c) => !c.pending).map((c) => page(`/clubs/${c.interest}/${c.id}`, "monthly", 0.6)),
    // Repeating events live on /weekly; their own pages change date every week.
    page("/weekly", "daily", 0.8),
    ...events.filter((e) => !e.recurrence).map((e) => page(`/events/${e.id}`, "weekly", 0.6)),
    page("/privacy", "monthly", 0.2),
    page("/terms", "monthly", 0.2),
    page("/cookies", "monthly", 0.2),
  ];
}
