import type * as GeoJSON from "geojson";
import type { ExpressionSpecification } from "maplibre-gl";

import type { HeatmapColorRamp } from "./types";

export const COLOR_RAMP_PRESETS: Record<HeatmapColorRamp, Array<[number, string]>> = {
  thermal: [
    [0, "rgba(33, 102, 172, 0)"],
    [0.2, "rgb(103, 169, 207)"],
    [0.4, "rgb(209, 229, 240)"],
    [0.6, "rgb(253, 219, 199)"],
    [0.8, "rgb(239, 138, 98)"],
    [1, "rgb(178, 24, 43)"],
  ],
  viridis: [
    [0, "rgba(68, 1, 84, 0)"],
    [0.25, "rgb(59, 82, 139)"],
    [0.5, "rgb(33, 145, 140)"],
    [0.75, "rgb(94, 201, 98)"],
    [1, "rgb(253, 231, 37)"],
  ],
  spectral: [
    [0, "rgba(0, 255, 0, 0)"],
    [0.2, "rgb(0, 255, 255)"],
    [0.4, "rgb(0, 255, 0)"],
    [0.6, "rgb(255, 255, 0)"],
    [0.8, "rgb(255, 128, 0)"],
    [1, "rgb(255, 0, 0)"],
  ],
  plasma: [
    [0, "rgba(13, 8, 135, 0)"],
    [0.25, "rgb(84, 2, 163)"],
    [0.5, "rgb(156, 23, 158)"],
    [0.75, "rgb(216, 87, 107)"],
    [1, "rgb(240, 249, 33)"],
  ],
  mono: [
    [0, "rgba(59, 130, 246, 0)"],
    [0.25, "rgba(59, 130, 246, 0.4)"],
    [0.5, "rgba(59, 130, 246, 0.7)"],
    [0.75, "rgba(37, 99, 235, 0.85)"],
    [1, "rgba(29, 78, 216, 1)"],
  ],
};

/**
 * 构造 MapLibre 热力图密度插值表达式
 */
export function buildHeatmapColorExpression(stops: Array<[number, string]>): ExpressionSpecification {
  const expr: unknown[] = ["interpolate", ["linear"], ["heatmap-density"]];
  for (const [stop, color] of stops) {
    expr.push(stop, color);
  }
  return expr as ExpressionSpecification;
}

export const EMPTY_HEATMAP_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: [],
};
