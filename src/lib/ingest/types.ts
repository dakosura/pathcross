import type { Event } from "@/types";

/** An event as produced by a source adapter, before it's stored. */
export type IngestedEvent = Omit<Event, "featured" | "placeholder" | "category"> & {
  external_id: string;
  /** Adapter's best guess; only applied when the event is first inserted. */
  category: Event["category"];
};

export interface SourceResult {
  source: string;
  events: IngestedEvent[];
}
