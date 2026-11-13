import type { EventCategory } from "@/types";

const styles: Record<EventCategory, string> = {
  Finance: "bg-teal-50 text-teal-700",
  Tech: "bg-navy-100 text-navy-700",
  "General Professional": "bg-slate-100 text-slate-700",
  Startup: "bg-amber-50 text-amber-700",
};

export function CategoryBadge({ category }: { category: EventCategory }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[category]}`}>
      {category}
    </span>
  );
}
