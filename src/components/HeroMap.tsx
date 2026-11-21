"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import type { Event } from "@/types";
import { HeroOverlay } from "./HeroOverlay";
import { createMap } from "@/lib/map";
import { useCycle } from "@/lib/use-cycle";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PIN_BASE = "block h-4 w-4 rounded-full border-2 border-cream bg-clay shadow-lg transition-transform duration-300 hover:scale-125";
const PIN_ON = ["scale-[1.8]", "ring-4", "ring-clay/30"];
const CYCLE_MS = 10_000;
interface PinParts { pin: HTMLElement; face: HTMLElement; halo: HTMLElement; label: HTMLElement }

/**
 * The homepage map: a flight from Hawaiʻi down to the featured event, then back
 * out to Honolulu, where a handful of upcoming events sit as pins to click.
 * `events` is that handful; `tourId` is the one the flight lands on.
 */
export function HeroMap({ events, tourId }: { events: Event[]; tourId: string }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const libRef = useRef<any>(null);
  const markers = useRef<Marker[]>([]);
  const pinEls = useRef(new Map<string, PinParts>());
  const timers = useRef<number[]>([]);
  const [arrived, setArrived] = useState(false);
  const [explore, setExplore] = useState(false);
  const [ready, setReady] = useState(false);

  const target = events.find((e) => e.id === tourId && e.lat && e.lng)!;
  const [selected, setSelected] = useState<Event>(target);

  // The pin for the event on the card stands out: bigger, pulsing, and named. The rest stay small dots.
  const selectedId = useRef(target.id);
  const highlight = useCallback(() => {
    pinEls.current.forEach(({ pin, face, halo, label }, id) => {
      const on = id === selectedId.current;
      PIN_ON.forEach((c) => face.classList.toggle(c, on));
      halo.classList.toggle("hidden", !on);
      label.classList.toggle("hidden", !on);
      pin.style.zIndex = on ? "2" : "";
    });
  }, []);
  useEffect(() => { selectedId.current = selected.id; highlight(); }, [selected, highlight]);

  // Once the camera has pulled back, move on to the next event every ten seconds.
  useCycle(explore, events, selected, setSelected, CYCLE_MS);

  const play = useCallback(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib) return;
    timers.current.forEach(clearTimeout);
    setArrived(false);
    setExplore(false);
    setSelected(target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches; // the same breakpoint the layout switches at
    // keep the pin clear of the headline panel
    const padding = wide ? { left: 480, top: 0, right: 0, bottom: 0 } : { left: 0, top: 0, right: 0, bottom: 0 };
    const end = { center: [target.lng!, target.lat!] as [number, number], zoom: 16.2, pitch: 55, bearing: -25, padding };

    // Back out to Honolulu with every pick in view, clear of the headline panel and the event card.
    // The camera is worked out by hand: fitBounds gives up while the map is still tilted and padded.
    const overview = () => {
      const pad = wide ? { left: 520, top: 90, right: 60, bottom: 110 } : { left: 90, top: 60, right: 90, bottom: 40 };
      const box = el.current!.getBoundingClientRect();
      const availW = Math.max(120, box.width - pad.left - pad.right);
      const availH = Math.max(120, box.height - pad.top - pad.bottom);
      const lats = events.map((e) => e.lat!), lngs = events.map((e) => e.lng!);
      const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
      const spanX = Math.max(...lngs) - Math.min(...lngs);
      const spanY = mercY(Math.max(...lats)) - mercY(Math.min(...lats));
      // Web Mercator: the world is 512 * 2^zoom pixels wide.
      const zoomFor = (px: number, units: number) => (units > 0 ? Math.log2(px / units) : 20);
      const zoom = Math.min(12.5, zoomFor(availW, (512 / 360) * spanX), zoomFor(availH, (512 / (2 * Math.PI)) * spanY)) - 0.2;
      const center: [number, number] = [(Math.max(...lngs) + Math.min(...lngs)) / 2, (Math.max(...lats) + Math.min(...lats)) / 2];
      return { center, zoom, pad };
    };

    if (reduce) {
      const { center, zoom, pad } = overview();
      map.jumpTo({ center, zoom, pitch: 0, bearing: 0, padding: pad });
      setArrived(true);
      setExplore(true);
      return;
    }
    map.jumpTo({ center: [-157.5, 20.7], zoom: 5.6, pitch: 0, bearing: 0, padding: { left: 0, top: 0, right: 0, bottom: 0 } });
    const steps: [number, () => void][] = [
      [600, () => map.flyTo({ center: [-157.97, 21.46], zoom: 9.2, duration: 2600, essential: true })],
      [3400, () => map.flyTo({ center: [-157.85, 21.3], zoom: 12, duration: 2600, essential: true })],
      [6200, () => map.flyTo({ ...end, duration: 3800, essential: true })],
      [10300, () => setArrived(true)],
      // Hold on the event for a few seconds, then pull back and let the page rest on the pins.
      [14800, () => {
        const { center, zoom, pad } = overview();
        map.flyTo({ center, zoom, pitch: 0, bearing: 0, padding: pad, duration: 3400, essential: true });
        setExplore(true);
      }],
    ];
    steps.forEach(([ms, fn]) => timers.current.push(window.setTimeout(fn, ms)));
  }, [target, events]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!el.current) return;
      const { map, lib: maplibregl } = await createMap(el.current, { center: [-157.5, 20.7], zoom: 5.6 });
      if (cancelled) { map.remove(); return; }
      mapRef.current = map;
      libRef.current = maplibregl;
      map.scrollZoom.disable();
      markers.current = events
        .filter((e) => e.lat && e.lng)
        .map((e) => {
          // MapLibre positions the outer element with a transform, so the styled pin sits inside it.
          const pin = document.createElement("button");
          pin.type = "button";
          pin.className = "block cursor-pointer";
          const halo = document.createElement("span");
          halo.className = "hidden absolute inset-0 animate-ping rounded-full bg-clay/50 motion-reduce:animate-none";
          const face = document.createElement("span");
          face.className = `relative ${PIN_BASE}`;
          const label = document.createElement("span");
          label.className = "hidden pointer-events-none absolute bottom-full left-1/2 mb-3 max-w-44 -translate-x-1/2 sm:max-w-56 truncate whitespace-nowrap rounded-md bg-forest px-2 py-1 text-xs font-semibold text-cream shadow-lg";
          label.textContent = e.title; // textContent only: event text comes from outside feeds
          pin.append(halo, face, label);
          pinEls.current.set(e.id, { pin, face, halo, label });
          pin.addEventListener("click", () => { setSelected(e); setArrived(true); });
          const marker = new maplibregl.Marker({ element: pin }).setLngLat([e.lng!, e.lat!]).addTo(map);
          // MapLibre labels every marker "Map marker"; name each one after its event instead.
          pin.setAttribute("aria-label", `${e.title}. Show details.`);
          return marker;
        });
      highlight(); // the markers now exist, so mark the one the card is already showing
      map.on("load", () => {
        if (cancelled) return;
        setReady(true);
        play();
      });
    })();
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      pinEls.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HeroOverlay target={selected} arrived={arrived} ready={ready} explore={explore} cycleMs={CYCLE_MS} onReplay={play}>
      <div ref={el} className="h-full w-full" />
    </HeroOverlay>
  );
}
