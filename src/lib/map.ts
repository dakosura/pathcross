import type { Map as MLMap, MapOptions } from "maplibre-gl";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const OAHU = { center: [-157.96, 21.46] as [number, number], zoom: 9.4 };

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Recolor the base map to the Forest Path palette. */
export function tint(style: any) {
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

/** Loads MapLibre (CSP build) and creates a tinted map. Returns the library too, for markers and popups. */
export async function createMap(container: HTMLElement, options: Partial<MapOptions> = {}): Promise<{ map: MLMap; lib: any }> {
  const [mod, style] = await Promise.all([
    import("maplibre-gl/dist/maplibre-gl-csp"),
    fetch(STYLE_URL).then((r) => r.json()),
  ]);
  const lib = (mod as any).default ?? mod;
  lib.setWorkerUrl("/maplibre-gl-csp-worker.js");
  const map = new lib.Map({ container, style: tint(style), attributionControl: { compact: true }, ...OAHU, ...options });
  return { map, lib };
}
