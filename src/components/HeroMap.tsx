"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import type { Event } from "@/types";
import { HeroOverlay } from "./HeroOverlay";
import { createMap } from "@/lib/map";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PIN_BASE = "block h-6 w-6 rounded-full border-2 border-cream bg-clay shadow-lg transition-transform duration-200 hover:scale-125";
const PIN_ON = ["scale-125", "ring-4", "ring-clay/40"];

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
  const pinEls = useRef(new Map<string, HTMLElement>());
  const timers = useRef<number[]>([]);
  const [arrived, setArrived] = useState(false);
  const [explore, setExplore] = useState(false);
  const [ready, setReady] = useState(false);

  const target = events.find((e) => e.id === tourId && e.lat && e.lng)!;
  const [selected, setSelected] = useState<Event>(target);

  // The pin whose card is showing gets a ring.
  useEffect(() => {
    pinEls.current.forEach((face, id) => PIN_ON.forEach((c) => face.classList.toggle(c, id === selected.id)));
  }, [selected]);

  const play = useCallback(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib) return;
    timers.current.forEach(clearTimeout);
    setArrived(false);
    setExplore(false);
    setSelected(target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 640px)").matches; // the same breakpoint the layout switches at
    // keep the pin clear of the headline panel
    const padding = wide ? { left: 480, top: 0, right: 0, bottom: 0 } : { left: 0, top: 0, right: 0, bottom: 0 };
    const end = { center: [target.lng!, target.lat!] as [number, number], zoom: 16.2, pitch: 55, bearing: -25, padding };

    // Back out to Honolulu with every pick in view, clear of the headline panel and the event card.
    // The camera is worked out by hand: fitBounds gives up while the map is still tilted and padded.
    const overview = () => {
      const pad = wide ? { left: 520, top: 60, right: 60, bottom: 240 } : { left: 40, top: 40, right: 40, bottom: 40 };
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
          pin.ariaLabel = `${e.title}. Show details.`;
          pin.className = "block cursor-pointer";
          const face = document.createElement("span");
          face.className = PIN_BASE;
          pin.append(face);
          pinEls.current.set(e.id, face);
          pin.addEventListener("click", () => { setSelected(e); setArrived(true); });
          const marker = new maplibregl.Marker({ element: pin }).setLngLat([e.lng!, e.lat!]).addTo(map);
          // MapLibre labels every marker "Map marker"; name each one after its event instead.
          pin.setAttribute("aria-label", `${e.title}. Show details.`);
          return marker;
        });
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
    <HeroOverlay target={selected} arrived={arrived} ready={ready} explore={explore} onReplay={play}>
      <div ref={el} className="h-full w-full" />
    </HeroOverlay>
  );
}
