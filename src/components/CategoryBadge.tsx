import type { EventCategory } from "@/types";

const styles: Record<EventCategory, string> = {
  Finance: "bg-moss-50 text-moss",
  Tech: "bg-sand text-bark",
  "General Professional": "bg-stone-100 text-stone-700",
  Startup: "bg-clay-50 text-clay-700",
};

export function CategoryBadge({ category }: { category: EventCategory }) {
  return (
    <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${styles[category]}`}>
      {category}
    </span>
  );
}
