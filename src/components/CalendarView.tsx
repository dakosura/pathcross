"use client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { Event, EventCategory } from "@/types";
import { categoryStyle } from "@/lib/categories";
import { formatDate, formatRange, formatTime } from "@/lib/format";
import { useHiddenSeries } from "@/lib/hidden-series";
import { addDays } from "@/lib/recurring";
import { DayView } from "./DayView";
import { SaveButton } from "./SaveButton";
import { SignupLink } from "./SignupLink";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `mineLabels` switches on My Calendar mode: `events` are already the person's own, so nothing is hidden
 * or offered for hiding, and each event id maps to the club it came from (or null if added directly).
 */
export function CalendarView({ events, today, categories, mineLabels }: { events: Event[]; today: string; categories: readonly EventCategory[]; mineLabels?: Record<string, string | null> }) {
  const isMine = mineLabels !== undefined;
  const [ty, tm] = today.split("-").map(Number);
  const [cursor, setCursor] = useState({ y: ty, m: tm - 1 });
  const [selected, setSelected] = useState<string | null>(today);
  const [category, setCategory] = useState<EventCategory | "All">("All");
  // The day shown full screen, or null when the month view is showing.
  const [open, setOpen] = useState<string | null>(null);
  // Repeating events this visitor has hidden (kept in their browser only).
  const { hidden, hide, show, showAll } = useHiddenSeries();

  const openDay = useCallback((iso: string) => {
    const [y, m] = iso.split("-").map(Number);
    setCursor({ y, m: m - 1 });
    setSelected(iso);
    setOpen(iso);
  }, []);
  const closeDay = useCallback(() => setOpen(null), []);
  const moveDay = useCallback((delta: number) => { if (open) openDay(addDays(open, delta)); }, [open, openDay]);

  const byDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      if (category !== "All" && e.category !== category) continue;
      if (!isMine && e.series_id && hidden.includes(e.series_id)) continue;
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    return map;
  }, [events, category, hidden, isMine]);

  // Titles of the hidden repeating events, so each can be brought back.
  const hiddenList = useMemo(() => {
    const titles = new Map<string, string>();
    for (const e of events) if (e.series_id && hidden.includes(e.series_id) && !titles.has(e.series_id)) titles.set(e.series_id, e.title);
    return [...titles.entries()].map(([id, title]) => ({ id, title }));
  }, [events, hidden]);

  const monthKey = `${cursor.y}-${pad(cursor.m + 1)}`;
  const firstWeekday = new Date(Date.UTC(cursor.y, cursor.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const move = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
    setSelected(null);
  };

  const monthEvents = [...byDay.entries()].filter(([d]) => d.startsWith(monthKey)).sort(([a], [b]) => a.localeCompare(b)).flatMap(([, list]) => list);
  const agenda = selected ? byDay.get(selected) ?? [] : monthEvents;
  const agendaTitle = selected ? formatDate(selected, { weekday: "long" }) : `All of ${MONTHS[cursor.m]}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => (
          <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${category === c ? "bg-forest text-cream" : "bg-sand text-bark hover:bg-line"}`}>
            {c !== "All" && <span className={`h-2 w-2 rounded-full ${categoryStyle[c].dot}`} />}
            {c}
          </button>
        ))}
      </div>

      {!isMine && hiddenList.length > 0 && (
        <div className="mb-4 rounded-2xl border border-line bg-sand/60 p-3 text-sm text-bark" aria-label="Hidden repeating events">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-ink">Hidden from your calendar ({hiddenList.length})</p>
            <button type="button" onClick={showAll} className="text-xs font-semibold text-clay-700 hover:underline">Show all again</button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {hiddenList.map((h) => (
              <li key={h.id}>
                <button type="button" onClick={() => show(h.id)} className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-ink ring-1 ring-line hover:bg-moss-50" aria-label={`Show ${h.title} again`}>
                  {h.title} <span aria-hidden="true" className="text-clay-700">Show</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mb-3 text-sm text-bark">Click any day to open it as a full-day view.</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_3px_rgba(42,36,25,0.06)]" aria-label="Month view">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <h2 className="text-xl font-semibold sm:text-2xl" aria-live="polite">{MONTHS[cursor.m]} <span className="text-bark/60">{cursor.y}</span></h2>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setCursor({ y: ty, m: tm - 1 }); setSelected(today); }} className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest ring-1 ring-forest/20 hover:bg-moss-50">Today</button>
              <button onClick={() => move(-1)} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-full text-forest hover:bg-sand">‹</button>
              <button onClick={() => move(1)} aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-full text-forest hover:bg-sand">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-line bg-sand/60 text-center text-[11px] font-bold uppercase tracking-widest text-bark/70">
            {DAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) return <div key={`b${i}`} className="min-h-16 border-b border-r border-line/70 bg-sand/30 sm:min-h-28" />;
              const iso = `${monthKey}-${pad(day)}`;
              const list = byDay.get(iso) ?? [];
              const isToday = iso === today;
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => openDay(iso)}
                  aria-pressed={isSelected}
                  aria-haspopup="dialog"
                  aria-label={`${formatDate(iso, { weekday: "long", month: "long", day: "numeric" })}, ${list.length} ${list.length === 1 ? "event" : "events"}. Open the full day.`}
                  className={`min-h-16 border-b border-r border-line/70 p-1.5 text-left align-top transition sm:min-h-28 sm:p-2 ${isSelected ? "bg-moss-50 ring-2 ring-inset ring-moss/50" : "hover:bg-sand/60"} ${iso < today ? "opacity-55" : ""}`}
                >
                  <span className={`inline-grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${isToday ? "bg-clay text-white" : "text-ink"}`}>{day}</span>
                  <span className="mt-1 hidden flex-col gap-1 sm:flex">
                    {list.slice(0, 2).map((e) => (
                      <span key={e.id} className={`truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 ${categoryStyle[e.category].chip}`}>
                        {formatTime(e.start_time).replace(":00", "")} {e.title}
                      </span>
                    ))}
                    {list.length > 2 && <span className="px-1 text-[11px] font-semibold text-bark">+{list.length - 2} more</span>}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {list.slice(0, 4).map((e) => <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${categoryStyle[e.category].dot}`} />)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="Events on the selected day" className="lg:max-h-[46rem] lg:overflow-y-auto">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">{agendaTitle}</h2>
            {selected && <button onClick={() => setSelected(null)} className="text-sm font-semibold text-clay-700 hover:underline">Show whole month</button>}
          </div>
          {agenda.length === 0 ? (
            <p className="rounded-2xl bg-sand p-8 text-center text-sm text-bark">{isMine ? (selected ? "Nothing from your network on this day." : "Nothing from your network this month.") : selected ? "Nothing listed for this day." : "No events listed for this month yet."}</p>
          ) : (
            <ul className="space-y-3">
              {agenda.map((e) => (
                <li key={e.id} className="relative rounded-2xl border border-line bg-card p-4" style={{ borderLeftWidth: 4, borderLeftColor: categoryStyle[e.category].hex }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-bark/80">
                    {!selected && `${formatDate(e.date)} · `}{formatRange(e.start_time, e.end_time)}
                  </p>
                  <Link href={`/events/${e.id}`} className="mt-1 block font-display text-lg font-semibold leading-snug text-ink hover:text-clay-700">{e.title}</Link>
                  <p className="mt-0.5 text-sm text-bark">{e.online ? "Online" : e.location.venue}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <SaveButton kind="events" id={e.id} />
                    <SignupLink event={e} />
                  </div>
                  {isMine && mineLabels?.[e.id] && <p className="mt-2 text-xs font-semibold text-moss">From your club: {mineLabels[e.id]}</p>}
                  {!isMine && e.series_id && (
                    <button type="button" onClick={() => hide(e.series_id!)} className="mt-3 text-xs font-semibold text-bark underline-offset-2 hover:text-clay-700 hover:underline">
                      Hide &ldquo;{e.title}&rdquo; from my calendar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {open && <DayView date={open} events={byDay.get(open) ?? []} today={today} onClose={closeDay} onMove={moveDay} onHide={hide} canHide={!isMine} />}
    </div>
  );
}
