"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import type { Event } from "@/types";
import { HeroOverlay } from "./HeroOverlay";
import { createMap } from "@/lib/map";

export function HeroMap({ events, tourId }: { events: Event[]; tourId: string }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const timers = useRef<number[]>([]);
  const [arrived, setArrived] = useState(false);
  const [ready, setReady] = useState(false);

  const target = events.find((e) => e.id === tourId && e.lat && e.lng)!;

  const play = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    timers.current.forEach(clearTimeout);
    setArrived(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.innerWidth >= 768;
    // keep the pin clear of the headline panel
    const padding = wide ? { left: 480, top: 0, right: 0, bottom: 0 } : { left: 0, top: 440, right: 0, bottom: 120 };
    const end = { center: [target.lng!, target.lat!] as [number, number], zoom: 16.2, pitch: 55, bearing: -25, padding };
    if (reduce) {
      map.jumpTo(end);
      setArrived(true);
      return;
    }
    map.jumpTo({ center: [-157.5, 20.7], zoom: 5.6, pitch: 0, bearing: 0, padding: { left: 0, top: 0, right: 0, bottom: 0 } });
    const steps: [number, () => void][] = [
      [600, () => map.flyTo({ center: [-157.97, 21.46], zoom: 9.2, duration: 2600, essential: true })],
      [3400, () => map.flyTo({ center: [-157.85, 21.3], zoom: 12, duration: 2600, essential: true })],
      [6200, () => map.flyTo({ ...end, duration: 3800, essential: true })],
      [10300, () => setArrived(true)],
    ];
    steps.forEach(([ms, fn]) => timers.current.push(window.setTimeout(fn, ms)));
  }, [target]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!el.current) return;
      const { map, lib: maplibregl } = await createMap(el.current, { center: [-157.5, 20.7], zoom: 5.6 });
      if (cancelled) { map.remove(); return; }
      mapRef.current = map;
      map.scrollZoom.disable();
      markers.current = events
        .filter((e) => e.lat && e.lng)
        .map((e) => {
          const pin = document.createElement("a");
          pin.href = `/events/${e.id}`;
          pin.ariaLabel = e.title;
          const big = e.id === tourId;
          pin.className = `block rounded-full border-2 border-cream bg-clay shadow-lg ${big ? "h-5 w-5 ring-4 ring-clay/30" : "h-3.5 w-3.5"}`;
          return new maplibregl.Marker({ element: pin }).setLngLat([e.lng!, e.lat!]).addTo(map);
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
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HeroOverlay target={target} arrived={arrived} ready={ready} onReplay={play}>
      <div ref={el} className="h-full w-full" />
    </HeroOverlay>
  );
}
