"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Event } from "@/types";
import { HeroOverlay } from "./HeroOverlay";
import { useCycle } from "@/lib/use-cycle";

/* eslint-disable @typescript-eslint/no-explicit-any */
function loadGoogle(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.google?.maps?.importLibrary) return resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=beta&loading=async`;
    s.async = true;
    s.onload = async () => {
      // importLibrary can appear a tick after the script's load event
      for (let i = 0; i < 50 && !w.google?.maps?.importLibrary; i++) await new Promise((r) => setTimeout(r, 100));
      w.google?.maps?.importLibrary ? resolve() : reject(new Error("importLibrary unavailable"));
    };
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
}

const START = { center: { lat: 20.7, lng: -157.5, altitude: 0 }, range: 1_400_000, tilt: 0, heading: 0 };

export function Hero3D({ events, tourId, apiKey, onFail }: { events: Event[]; tourId: string; apiKey: string; onFail: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const timer = useRef<number>(0);
  const safety = useRef<number>(0);
  const [arrived, setArrived] = useState(false);
  const [explore, setExplore] = useState(false);
  const [ready, setReady] = useState(false);
  const target = events.find((e) => e.id === tourId && e.lat && e.lng)!;
  const [selected, setSelected] = useState<Event>(target);
  const pinsRef = useRef(new Map<string, any>());

  // The card's event is starred on the map, and the card moves on every ten seconds once the camera has pulled back.
  useEffect(() => {
    pinsRef.current.forEach((m, id) => { try { m.label = id === selected.id ? "★" : ""; } catch {} });
  }, [selected]);
  useCycle(explore, events, selected, setSelected, 10_000);

  const play = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    window.clearTimeout(timer.current);
    window.clearTimeout(safety.current);
    map.stopCameraAnimation?.();
    setArrived(false);
    setExplore(false);
    setSelected(target);
    const end = {
      center: { lat: target.lat!, lng: target.lng!, altitude: 20 },
      range: 520, tilt: 65, heading: -25,
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // After a pause on the event, pull back over Honolulu so the picks can be clicked.
    const lats = events.map((e) => e.lat!), lngs = events.map((e) => e.lng!);
    const spanM = Math.max(Math.max(...lats) - Math.min(...lats), (Math.max(...lngs) - Math.min(...lngs)) * 0.93) * 111_000;
    const overview = {
      center: { lat: (Math.max(...lats) + Math.min(...lats)) / 2, lng: (Math.max(...lngs) + Math.min(...lngs)) / 2, altitude: 0 },
      range: Math.max(14_000, spanM * 2.2 + 6_000), tilt: 35, heading: 0,
    };
    const settle = (durationMillis: number) => { setExplore(true); map.flyCameraTo({ endCamera: overview, durationMillis }); };
    if (reduce) {
      Object.assign(map, overview);
      setArrived(true);
      setExplore(true);
      return;
    }
    Object.assign(map, START);
    // One continuous flight: no stops between Oahu, Honolulu and the venue.
    timer.current = window.setTimeout(() => {
      map.addEventListener("gmp-animationend", () => {
        window.clearTimeout(safety.current);
        setArrived(true);
        timer.current = window.setTimeout(() => settle(4500), 4500);
      }, { once: true });
      map.flyCameraTo({ endCamera: end, durationMillis: 13000 });
    }, 700);
    // safety net if the animation event never fires
    safety.current = window.setTimeout(() => { setArrived(true); settle(4500); }, 19000);
  }, [target, events]);

  useEffect(() => {
    let cancelled = false;
    (window as any).gm_authFailure = () => { console.error("Hero3D: Google auth failure"); onFail(); };
    (async () => {
      try {
        await loadGoogle(apiKey);
        const { Map3DElement, Marker3DElement, Marker3DInteractiveElement } = await (window as any).google.maps.importLibrary("maps3d");
        if (cancelled || !el.current) return;
        const map = new Map3DElement({ ...START, mode: "HYBRID" });
        (map as HTMLElement).style.cssText = "width:100%;height:100%;display:block";
        el.current.appendChild(map);
        mapRef.current = map;
        for (const e of events) {
          if (!e.lat || !e.lng) continue;
          try {
            // The interactive marker can be clicked; fall back to the plain one if this Maps build lacks it.
            const Pin = Marker3DInteractiveElement ?? Marker3DElement;
            const m = new Pin({
              position: { lat: e.lat, lng: e.lng, altitude: 30 },
              altitudeMode: "RELATIVE_TO_GROUND",
              extruded: true,
              label: e.id === tourId ? "★" : "",
            });
            m.addEventListener("gmp-click", () => { setSelected(e); setArrived(true); });
            pinsRef.current.set(e.id, m);
            map.append(m);
          } catch {}
        }
        setReady(true);
        play();
      } catch (err) {
        console.error("Hero3D failed:", err);
        if (!cancelled) onFail();
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
      window.clearTimeout(safety.current);
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HeroOverlay target={selected} arrived={arrived} ready={ready} explore={explore} cycleMs={10_000} onReplay={play}>
      <div ref={el} className="h-full w-full" />
    </HeroOverlay>
  );
}
