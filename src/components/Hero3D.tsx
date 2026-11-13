"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Event } from "@/types";
import { HeroOverlay } from "./HeroOverlay";

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
  const [ready, setReady] = useState(false);
  const target = events.find((e) => e.id === tourId && e.lat && e.lng)!;

  const play = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    window.clearTimeout(timer.current);
    window.clearTimeout(safety.current);
    map.stopCameraAnimation?.();
    setArrived(false);
    const end = {
      center: { lat: target.lat!, lng: target.lng!, altitude: 20 },
      range: 520, tilt: 65, heading: -25,
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      Object.assign(map, end);
      setArrived(true);
      return;
    }
    Object.assign(map, START);
    // One continuous flight: no stops between Oahu, Honolulu and the venue.
    timer.current = window.setTimeout(() => {
      map.addEventListener("gmp-animationend", () => setArrived(true), { once: true });
      map.flyCameraTo({ endCamera: end, durationMillis: 13000 });
    }, 700);
    // safety net if the animation event never fires
    safety.current = window.setTimeout(() => setArrived(true), 19000);
  }, [target]);

  useEffect(() => {
    let cancelled = false;
    (window as any).gm_authFailure = () => { console.error("Hero3D: Google auth failure"); onFail(); };
    (async () => {
      try {
        await loadGoogle(apiKey);
        const { Map3DElement, Marker3DElement } = await (window as any).google.maps.importLibrary("maps3d");
        if (cancelled || !el.current) return;
        const map = new Map3DElement({ ...START, mode: "HYBRID" });
        (map as HTMLElement).style.cssText = "width:100%;height:100%;display:block";
        el.current.appendChild(map);
        mapRef.current = map;
        for (const e of events) {
          if (!e.lat || !e.lng) continue;
          try {
            const m = new Marker3DElement({
              position: { lat: e.lat, lng: e.lng, altitude: 30 },
              altitudeMode: "RELATIVE_TO_GROUND",
              extruded: true,
              label: e.id === tourId ? "★" : "",
            });
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
    <HeroOverlay target={target} arrived={arrived} ready={ready} onReplay={play}>
      <div ref={el} className="h-full w-full" />
    </HeroOverlay>
  );
}
