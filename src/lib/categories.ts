import type { EventCategory } from "@/types";

/** One hue per category, used for badges, calendar chips and map pins. */
export const categoryStyle: Record<EventCategory, { hex: string; badge: string; dot: string; chip: string }> = {
  Finance: { hex: "#4a6b4f", badge: "bg-moss-50 text-moss", dot: "bg-moss", chip: "bg-moss-50 text-forest" },
  Tech: { hex: "#2f6f7a", badge: "bg-lagoon-50 text-lagoon", dot: "bg-lagoon", chip: "bg-lagoon-50 text-lagoon" },
  "General Professional": { hex: "#7a6552", badge: "bg-sand text-bark", dot: "bg-bark", chip: "bg-sand text-bark" },
  Startup: { hex: "#c17f4a", badge: "bg-clay-50 text-clay-700", dot: "bg-clay", chip: "bg-clay-50 text-clay-700" },
  Community: { hex: "#b58a2c", badge: "bg-[#f3ead3] text-[#7a5c1e]", dot: "bg-[#b58a2c]", chip: "bg-[#f3ead3] text-[#7a5c1e]" },
  Fitness: { hex: "#8a4f5b", badge: "bg-[#f3e4e6] text-[#7a3f4b]", dot: "bg-[#8a4f5b]", chip: "bg-[#f3e4e6] text-[#7a3f4b]" },
  Volunteer: { hex: "#3f6b5a", badge: "bg-[#dfe9df] text-forest", dot: "bg-[#3f6b5a]", chip: "bg-[#dfe9df] text-forest" },
  Sports: { hex: "#35567a", badge: "bg-[#e1e9f2] text-[#2c4663]", dot: "bg-[#35567a]", chip: "bg-[#e1e9f2] text-[#2c4663]" },
  "Real Estate": { hex: "#8a6a2f", badge: "bg-[#f1e8d3] text-[#6b501f]", dot: "bg-[#8a6a2f]", chip: "bg-[#f1e8d3] text-[#6b501f]" },
  "Food & Drink": { hex: "#9a4a3a", badge: "bg-[#f4e1dc] text-[#7a3a2d]", dot: "bg-[#9a4a3a]", chip: "bg-[#f4e1dc] text-[#7a3a2d]" },
};
