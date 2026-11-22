import type * as GeoJSON from "geojson";
import type * as MapLibreGL from "maplibre-gl";

import { buildSplitArcSegments } from "../utils/geoEngine";
import type { ResolvedArcItem } from "./useArcTopology";

const HIT_LINE_MIN_WIDTH = 12;

export function buildArcPaintSpecs(
  arcColor: string,
  arcHoverColor: string,
  arcWidth: number,
  effectiveHoverWidth: number,
  arcOpacity: number,
) {
  return {
    lineColor: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      arcHoverColor,
      ["coalesce", ["get", "color"], arcColor],
    ] as MapLibreGL.ExpressionSpecification,
    lineWidth: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      effectiveHoverWidth,
      arcWidth,
    ] as MapLibreGL.ExpressionSpecification,
    lineOpacity: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      arcOpacity,
    ] as MapLibreGL.ExpressionSpecification,
    hitLineColor: ["coalesce", ["get", "color"], arcColor] as MapLibreGL.ExpressionSpecification,
    hitLineWidth: Math.max(HIT_LINE_MIN_WIDTH, arcWidth + 8),
  };
}

export function buildArcFeatureCollection(
  data: ResolvedArcItem[],
  curvature: number,
  samples: number,
): GeoJSON.FeatureCollection<GeoJSON.MultiLineString> {
  return {
    type: "FeatureCollection",
    features: data.map((arc) => ({
      type: "Feature",
      id: arc.id,
      properties: {
        id: arc.id,
        ...(arc.color ? { color: arc.color } : {}),
      },
      geometry: {
        type: "MultiLineString",
        coordinates: buildSplitArcSegments(arc.from, arc.to, curvature, samples),
      },
    })),
  };
}
