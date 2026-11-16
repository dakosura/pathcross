import { formatDate } from "@/lib/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Tear-off calendar tile: month, day, weekday. */
export function DateBlock({ iso, tone = "light" }: { iso: string; tone?: "light" | "dark" }) {
  const [, m, d] = iso.split("-").map(Number);
  const weekday = formatDate(iso, { weekday: "short", month: undefined, day: undefined });
  return (
    <div className={`w-14 shrink-0 overflow-hidden rounded-xl text-center ring-1 ${tone === "dark" ? "bg-cream/10 ring-cream/20" : "bg-white/70 ring-line"}`}>
      <div className={`py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone === "dark" ? "bg-clay text-white" : "bg-forest text-cream"}`}>{MONTHS[m - 1]}</div>
      <div className={`font-display text-2xl font-semibold leading-7 ${tone === "dark" ? "text-cream" : "text-ink"}`}>{d}</div>
      <div className={`pb-1 text-[10px] font-medium uppercase tracking-wide ${tone === "dark" ? "text-cream/60" : "text-bark/70"}`}>{weekday}</div>
    </div>
  );
}
