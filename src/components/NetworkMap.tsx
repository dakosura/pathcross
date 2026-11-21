"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import type { Club, Event } from "@/types";
import { createMap, OAHU } from "@/lib/map";
import { useNetwork } from "@/lib/network";
import { SignInForm } from "./SignInForm";
import { interests, interestById } from "@/lib/interests";
import { categoryStyle } from "@/lib/categories";
import { formatDate, formatTime } from "@/lib/format";
import { signupUrl } from "@/lib/links";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Pin {
  key: string;
  kind: "club" | "event";
  title: string;
  detail: string;
  href: string;
  external?: string;
  externalLabel: string;
  color: string;
  lat: number;
  lng: number;
  clubId?: string;
  id: string;
  /** In the visitor's network, as opposed to just available */
  saved: boolean;
}

const node = (tag: string, cls: string, text?: string) => {
  const n = document.createElement(tag);
  n.className = cls;
  if (text) n.textContent = text; // textContent only: listing text comes from outside feeds
  return n;
};

function popupContent(pins: Pin[]) {
  const wrap = node("div", "space-y-3");
  pins.forEach((p, i) => {
    const row = node("div", i ? "border-t border-line pt-3" : "");
    row.append(node("p", "text-[10px] font-bold uppercase tracking-widest text-clay-700", p.kind === "club" ? "Club" : "Event"));
    const title = node("a", "block font-display text-base font-semibold leading-snug text-ink hover:text-clay-700", p.title) as HTMLAnchorElement;
    title.href = p.href;
    row.append(title, node("p", "mt-0.5 text-xs text-bark", p.detail));
    if (p.external) {
      const a = node("a", "mt-1.5 inline-block text-xs font-semibold text-clay-700 hover:underline", `${p.externalLabel} ↗`) as HTMLAnchorElement;
      a.href = p.external;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      row.append(a);
    }
    wrap.append(row);
  });
  return wrap;
}

function Row({ on, onClick, title, sub, tag, color }: { on: boolean; onClick: () => void; title: string; sub: string; tag?: string; color: string }) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={on}
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${on ? "bg-moss-50 ring-1 ring-moss/30" : "hover:bg-sand"}`}
      >
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-white transition ${on ? "border-transparent" : "border-line bg-white"}`} style={on ? { background: color } : undefined}>
          {on && <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{title}</span>
          <span className="block truncate text-xs text-bark">{sub}</span>
        </span>
        {tag && <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bark">{tag}</span>}
      </button>
    </li>
  );
}

export function NetworkMap({ events, clubs }: { events: Event[]; clubs: Club[] }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const libRef = useRef<any>(null);
  const markers = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<"clubs" | "events">("clubs");
  const [q, setQ] = useState("");
  // Show every available club and event on the map, not just the visitor's picks.
  const [seeAll, setSeeAll] = useState(false);
  const { saved, has, isGoing, toggle, clear, user, status, signOut, error } = useNetwork();

  // The visitor's picks that can be placed on the map, plus everything else when "See all?" is on
  const pins = useMemo<Pin[]>(() => {
    const out: Pin[] = [];
    for (const c of clubs) {
      const isSaved = saved.clubs.includes(c.id);
      if ((!isSaved && !seeAll) || c.lat == null || c.lng == null) continue;
      const interest = interestById(c.interest)!;
      out.push({
        key: `club:${c.id}`, id: c.id, kind: "club", title: c.name, detail: `${interest.short} · ${c.area}`,
        href: `/clubs/${c.interest}/${c.id}`, external: c.url, externalLabel: "Visit site", color: interest.hex, lat: c.lat, lng: c.lng, saved: isSaved,
      });
    }
    for (const e of events) {
      const isSaved = saved.events.includes(e.id);
      if ((!isSaved && !seeAll) || e.lat == null || e.lng == null) continue;
      out.push({
        key: `event:${e.id}`, id: e.id, kind: "event", title: e.title,
        detail: `${formatDate(e.date)} · ${formatTime(e.start_time)} · ${e.location.venue}`,
        href: `/events/${e.id}`, external: signupUrl(e), externalLabel: "Sign up", color: categoryStyle[e.category].hex,
        lat: e.lat, lng: e.lng, clubId: e.club_id, saved: isSaved,
      });
    }
    return out;
  }, [clubs, events, saved, seeAll]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!el.current) return;
      try {
        const { map, lib } = await createMap(el.current, { cooperativeGestures: window.innerWidth < 1024 });
        if (cancelled) { map.remove(); return; }
        mapRef.current = map;
        libRef.current = lib;
        map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
        map.on("load", () => {
          if (cancelled) return;
          map.addSource("links", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          map.addLayer({
            id: "links", type: "line", source: "links",
            layout: { "line-cap": "round" },
            paint: { "line-color": "#c17f4a", "line-width": 2, "line-dasharray": [1, 2.2], "line-opacity": 0.85 },
          });
          setReady(true);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw pins and the paths between a club and its events whenever the picks change
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    const groups = new Map<string, Pin[]>();
    for (const p of pins) {
      const k = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
      groups.set(k, [...(groups.get(k) ?? []), p]);
    }
    for (const group of groups.values()) {
      const lead = group.find((p) => p.saved && p.kind === "club") ?? group.find((p) => p.saved) ?? group.find((p) => p.kind === "club") ?? group[0];
      const anySaved = group.some((p) => p.saved);
      // MapLibre positions the outer element with a transform, so the animated, styled pin sits inside it
      const pin = node("button", "block cursor-pointer");
      pin.setAttribute("aria-label", group.map((p) => p.title).join(", "));
      const face = node("span", "pin-drop grid place-items-center border-2 border-cream text-[11px] font-bold text-white shadow-lg " + (lead.kind === "club" ? "h-9 w-9 rounded-xl" : "h-7 w-7 rounded-full") + (anySaved ? "" : " opacity-60"));
      face.style.background = lead.color;
      face.textContent = group.length > 1 ? String(group.length) : lead.kind === "club" ? lead.title.charAt(0) : "";
      pin.append(face);
      const popup = new lib.Popup({ offset: 22, maxWidth: "280px" }).setDOMContent(popupContent(group));
      markers.current.push(new lib.Marker({ element: pin }).setLngLat([lead.lng, lead.lat]).setPopup(popup).addTo(map));
    }

    const lines = pins
      .filter((p) => p.saved && p.kind === "event" && p.clubId)
      .flatMap((ev) => {
        const club = pins.find((p) => p.saved && p.kind === "club" && p.id === ev.clubId);
        if (!club || (club.lat === ev.lat && club.lng === ev.lng)) return [];
        return [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[club.lng, club.lat], [ev.lng, ev.lat]] } }];
      });
    (map.getSource("links") as any)?.setData({ type: "FeatureCollection", features: lines });

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    if (pins.length === 0) map.easeTo({ ...OAHU, duration });
    else if (groups.size === 1) map.easeTo({ center: [pins[0].lng, pins[0].lat], zoom: 13.5, duration });
    else {
      const b = new lib.LngLatBounds();
      pins.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: 90, maxZoom: 14.5, duration });
    }
  }, [pins, ready]);

  const needle = q.trim().toLowerCase();
  const shownClubs = clubs.filter((c) => !needle || `${c.name} ${c.area} ${c.blurb}`.toLowerCase().includes(needle));
  const shownEvents = events.filter((e) => !needle || `${e.title} ${e.organizer} ${e.location.venue} ${e.category}`.toLowerCase().includes(needle));
  const total = saved.clubs.length + saved.events.length;
  const unmapped = total - pins.filter((p) => p.saved).length;

  const signedOut = status === "ready" && !user;

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row">
      <aside className="order-2 flex min-h-0 min-w-0 flex-col border-line bg-card lg:order-1 lg:w-[400px] lg:shrink-0 lg:border-r">
        <div className="border-b border-line px-5 pb-4 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">Oʻahu</p>
          <h1 className="mt-1 text-3xl font-semibold">My Network</h1>
          <p className="mt-2 text-sm text-bark">Pick the clubs you belong to and the events you&apos;re going to. Each one lands on your map.</p>
          {user && (
            <>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <p className="font-medium text-ink">
              {saved.clubs.length} {saved.clubs.length === 1 ? "club" : "clubs"} · {saved.events.length} {saved.events.length === 1 ? "event" : "events"}
            </p>
            {total > 0 && <button type="button" onClick={clear} className="text-xs font-semibold text-clay-700 hover:underline">Clear all</button>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-sand p-1 text-sm font-semibold" role="tablist">
            {(["clubs", "events"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full py-2 capitalize transition ${tab === t ? "bg-card text-forest shadow-sm" : "text-bark hover:text-ink"}`}>
                {t === "clubs" ? "Clubs & programs" : "Events"}
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "clubs" ? "Search clubs…" : "Search events…"} aria-label="Search" className="mt-3 w-full rounded-full border border-line bg-white/70 px-4 py-2 text-sm outline-none focus:border-moss" />
            </>
          )}
        </div>
        {status === "loading" && <div className="m-5 h-40 animate-pulse rounded-2xl bg-sand" aria-label="Loading your network" />}
        {signedOut && (
          <div className="px-5 py-6">
            <div className="rounded-2xl border border-line bg-white/60 p-5">
              <h2 className="text-xl font-semibold">Sign in to build your network</h2>
              <p className="mt-2 mb-4 text-sm text-bark">Your clubs and events are saved to your account, so your map is there on any device. No password needed.</p>
              <SignInForm />
            </div>
            <p className="mt-4 text-sm text-bark">Just looking? <Link href="/events" className="font-semibold text-clay-700 hover:underline">Events</Link>, the <Link href="/calendar" className="font-semibold text-clay-700 hover:underline">calendar</Link> and <Link href="/clubs" className="font-semibold text-clay-700 hover:underline">Clubs &amp; Programs</Link> are open to everyone.</p>
          </div>
        )}
        {user && error && <p role="alert" className="mx-5 mt-3 rounded-xl bg-clay-50 px-4 py-2.5 text-sm font-medium text-clay-700">{error}</p>}
        {user && (
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 lg:max-h-none">
          {tab === "clubs" ? (
            interests.map((interest) => {
              const list = shownClubs.filter((c) => c.interest === interest.id);
              if (!list.length) return null;
              return (
                <section key={interest.id} className="mb-3">
                  <h2 className="px-3 pb-1 pt-2 font-sans text-[11px] font-bold uppercase tracking-widest text-bark/70">{interest.name}</h2>
                  <ul className="space-y-0.5">
                    {list.map((c) => (
                      <Row key={c.id} on={has("clubs", c.id)} onClick={() => toggle("clubs", c.id)} title={c.name} sub={c.area} color={interest.hex} tag={c.lat == null ? (c.area === "Online" ? "Online" : "No pin yet") : undefined} />
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <ul className="space-y-0.5">
              {shownEvents.map((e) => (
                <Row key={e.id} on={has("events", e.id)} onClick={() => toggle("events", e.id)} title={e.title} sub={`${formatDate(e.date)} · ${formatTime(e.start_time)} · ${e.online ? "Online" : e.location.venue}`} color={categoryStyle[e.category].hex} tag={isGoing(e.id) ? "Going" : e.lat == null ? (e.online ? "Online" : "No pin yet") : undefined} />
              ))}
            </ul>
          )}
          {(tab === "clubs" ? shownClubs.length : shownEvents.length) === 0 && <p className="px-3 py-8 text-center text-sm text-bark">Nothing matches that search.</p>}
        </div>
        )}
        {user && (
          <p className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-bark/80">
            <span className="truncate">Signed in as <span className="font-semibold text-ink">{user.email}</span></span>
            <button type="button" onClick={signOut} className="shrink-0 font-semibold text-clay-700 hover:underline">Sign out</button>
          </p>
        )}
      </aside>

      <div className={`relative order-1 h-[52dvh] min-w-0 bg-sand lg:order-2 lg:block lg:h-auto lg:flex-1 ${signedOut ? "hidden" : ""}`}>
        <div ref={el} className="h-full w-full" />
        <label className="absolute left-3 top-3 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold text-ink shadow">
          <input type="checkbox" checked={seeAll} onChange={(e) => setSeeAll(e.target.checked)} className="h-4 w-4 accent-[#c17f4a]" />
          See all?
        </label>
        {failed && <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-bark">The map couldn&apos;t load. Your picks are still saved in the list.</p>}
        {ready && pins.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
            <p className="rise rounded-full bg-forest/95 px-5 py-2.5 text-center text-sm font-medium text-cream shadow-xl">
              {seeAll ? "None of the available listings have a map pin yet." : !user ? "Sign in, then tap a club or event to place it on your map. Or tick See all? to browse everything." : total > 0 ? "Your picks are online or don't have a map pin yet." : "Your map is empty. Tap a club or event to place it here."}
            </p>
          </div>
        )}
        {ready && pins.length > 0 && unmapped > 0 && (
          <p className="absolute left-3 top-14 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-bark shadow">+{unmapped} without a map pin</p>
        )}
      </div>
    </div>
  );
}
