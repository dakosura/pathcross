import type { EventCategory } from "@/types";
import { categoryStyle } from "@/lib/categories";

export function CategoryBadge({ category }: { category: EventCategory }) {
  const s = categoryStyle[category];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {category}
    </span>
  );
}
