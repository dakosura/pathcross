import type { EventCategory } from "@/types";

/** One hue per category, used for badges, calendar chips and map pins. */
export const categoryStyle: Record<EventCategory, { hex: string; badge: string; dot: string; chip: string }> = {
  Finance: { hex: "#4a6b4f", badge: "bg-moss-50 text-moss", dot: "bg-moss", chip: "bg-moss-50 text-forest" },
  Tech: { hex: "#2f6f7a", badge: "bg-lagoon-50 text-lagoon", dot: "bg-lagoon", chip: "bg-lagoon-50 text-lagoon" },
  "General Professional": { hex: "#7a6552", badge: "bg-sand text-bark", dot: "bg-bark", chip: "bg-sand text-bark" },
  Startup: { hex: "#c17f4a", badge: "bg-clay-50 text-clay-700", dot: "bg-clay", chip: "bg-clay-50 text-clay-700" },
};
