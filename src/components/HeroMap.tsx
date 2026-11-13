"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker } from "maplibre-gl";
import type { Event } from "@/types";
import { formatDate, formatRange } from "@/lib/format";
import { PromptBox } from "./PromptBox";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/* eslint-disable @typescript-eslint/no-explicit-any */
function tint(style: any) {
  const fills: Record<string, string> = {
    background: "#efe9de",
    water: "#bcd0c6",
    park: "#d3dec6",
    landcover_wood: "#c9d6bb",
    landuse_residential: "#e9e2d4",
    building: "#ddd3c2",
  };
  for (const l of style.layers) {
    if (fills[l.id]) {
      const key = l.type === "background" ? "background-color" : "fill-color";
      l.paint = { ...l.paint, [key]: fills[l.id] };
    } else if (l.type === "line" && l.id.startsWith("highway")) {
      const casing = l.id.includes("casing");
      l.paint = { ...l.paint, "line-color": casing ? "#e0d6c4" : "#fcfaf6" };
    } else if (l.type === "symbol") {
      l.paint = { ...l.paint, "text-color": "#5c4a3a", "text-halo-color": "#f7f4ef" };
    }
  }
  return style;
}

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
      const [mod, style] = await Promise.all([
        import("maplibre-gl/dist/maplibre-gl-csp"),
        fetch(STYLE_URL).then((r) => r.json()),
      ]);
      if (cancelled || !el.current) return;
      const maplibregl = (mod as any).default ?? mod;
      maplibregl.setWorkerUrl("/maplibre-gl-csp-worker.js");
      const map = new maplibregl.Map({
        container: el.current,
        style: tint(style),
        center: [-157.5, 20.7],
        zoom: 5.6,
        attributionControl: { compact: true },
      });
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
    <section className="relative h-[720px] overflow-hidden bg-sand sm:h-[680px]">
      <div className="absolute inset-0"><div ref={el} className="h-full w-full" /></div>
      <div className="pointer-events-none relative mx-auto flex h-full max-w-6xl flex-col justify-between gap-4 px-4 py-6 sm:px-6 sm:py-10">
        <div className="pointer-events-auto max-w-xl rounded-xl bg-forest/95 p-5 text-cream shadow-xl backdrop-blur sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay-300">Honolulu · Professional networking</p>
          <h1 className="text-3xl font-semibold sm:text-5xl">
            Every good connection starts with <span className="italic text-clay-300">crossing paths.</span>
          </h1>
          <p className="mt-4 hidden text-cream/75 sm:block">
            A curated guide to the events, groups, and communities worth showing up for.
          </p>
          <div className="mt-5 sm:mt-6"><PromptBox /></div>
        </div>

        <div className="flex items-end justify-between gap-4 pb-5">
          <button
            onClick={play}
            disabled={!ready}
            className="pointer-events-auto rounded-lg bg-card/95 px-3 py-2 text-sm font-medium text-forest shadow-md hover:bg-card disabled:opacity-50"
          >
            ↻ Replay
          </button>
          <div
            className={`pointer-events-auto w-full max-w-sm rounded-xl bg-card p-5 shadow-xl ring-1 ring-line transition duration-700 ${
              arrived ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-clay-700">Happening in Honolulu</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{target.title}</h2>
            <p className="mt-1 text-sm text-bark">
              {formatDate(target.date)} · {formatRange(target.start_time, target.end_time)}
              <br />
              {target.location.venue}
            </p>
            <Link href={`/events/${target.id}`} className="mt-4 inline-block rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-700">
              View event →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
