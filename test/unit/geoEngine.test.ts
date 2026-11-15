import type * as GeoJSON from "geojson";
import { describe, expect, it } from "vitest";

import {
  buildAdaptiveSchemeRamp,
  buildChoroplethSteps,
  buildSplitArcSegments,
  computeBounds,
  extractGeoJSONPoints,
  gcj02ToBd09,
  gcj02ToWgs84,
  isValidCoordinate,
  resolveBoundingCenter,
  resolveCssColorToHex,
  sanitizeCoordinatesList,
  transformGeoJSON,
  wgs84ToBd09,
  wgs84ToGcj02,
} from "@/components/map";
import * as MapCore from "@/components/map/core";

describe("GeoEngine & Coordinate Precision", () => {
  it("validates finite and range-bounded WGS/Mercator coordinates", () => {
    expect(isValidCoordinate([116.4074, 39.9042])).toBe(true);
    expect(isValidCoordinate([-180, -85])).toBe(true);
    expect(isValidCoordinate([180, 90])).toBe(true);

    expect(isValidCoordinate([Number.NaN, 39.9])).toBe(false);
    expect(isValidCoordinate([116.4, Number.POSITIVE_INFINITY])).toBe(false);
    expect(isValidCoordinate([180.01, 39.9])).toBe(false);
    expect(isValidCoordinate([116.4, -91])).toBe(false);
    expect(isValidCoordinate(undefined)).toBe(false);
    expect(
      sanitizeCoordinatesList([
        [116.4, 39.9],
        [Number.NaN, 0],
        [121.4, 31.2],
      ]),
    ).toEqual([
      [116.4, 39.9],
      [121.4, 31.2],
    ]);
  });

  it("achieves sub-millimeter iterative convergence for gcj02ToWgs84 inside China", () => {
    const beijingWgs: [number, number] = [116.391275, 39.907331];
    const gcj = wgs84ToGcj02(beijingWgs);
    const recoveredWgs = gcj02ToWgs84(gcj);

    expect(Math.abs(recoveredWgs[0] - beijingWgs[0])).toBeLessThan(1e-7);
    expect(Math.abs(recoveredWgs[1] - beijingWgs[1])).toBeLessThan(1e-7);
  });

  it("guards out-of-China coordinates as lossless identity across BD-09 and GCJ-02", () => {
    const newYork: [number, number] = [-74.006, 40.7128];
    const london: [number, number] = [-0.1276, 51.5072];

    expect(gcj02ToBd09(newYork)).toEqual(newYork);
    expect(wgs84ToBd09(london)).toEqual(london);
    expect(gcj02ToWgs84(newYork)).toEqual(newYork);
  });

  it("computes single-point, standard, and antimeridian bounds accurately", () => {
    expect(computeBounds([])).toBeNull();

    const single = computeBounds([[116.4, 39.9]]);
    expect(single).toMatchObject({
      isSinglePoint: true,
      spansAntimeridian: false,
      center: [116.4, 39.9],
    });

    const pacific = computeBounds([
      [170, 35],
      [-170, 37],
    ]);
    expect(pacific).not.toBeNull();
    expect(pacific?.spansAntimeridian).toBe(true);
    expect(pacific?.isSinglePoint).toBe(false);
    expect(Math.abs(pacific?.center[0] ?? 0)).toBeGreaterThanOrEqual(179);
    expect(pacific?.center[1]).toBe(36);

    expect(resolveBoundingCenter([[121.47, 31.23]])).toEqual([121.47, 31.23]);
  });

  it("splits antimeridian arcs into continuous ±180 segments", () => {
    const tokyo: [number, number] = [139.6917, 35.6895];
    const sanFrancisco: [number, number] = [-122.4194, 37.7749];

    const segments = buildSplitArcSegments(tokyo, sanFrancisco, 0.2, 48);
    expect(segments.length).toBe(2);
    expect(segments[0][segments[0].length - 1][0]).toBe(180);
    expect(segments[1][0][0]).toBe(-180);

    for (const seg of segments) {
      for (const [lng, lat] of seg) {
        expect(lng).toBeGreaterThanOrEqual(-180);
        expect(lng).toBeLessThanOrEqual(180);
        expect(lat).toBeGreaterThanOrEqual(-85);
        expect(lat).toBeLessThanOrEqual(85);
      }
    }
  });

  it("preserves decimal precision in buildChoroplethSteps for [0, 1] ratios", () => {
    const { legendSteps, thresholds } = buildChoroplethSteps(
      [0.12, 0.35, 0.68, 0.94],
      ["#eee", "#ccc", "#999", "#333"],
      "rate",
    );
    expect(legendSteps.length).toBe(4);
    expect(legendSteps.every((s) => !s.rangeText.includes("0.0 - 0.0") && s.rangeText !== "0 - 0")).toBe(true);
    expect(thresholds[0]).toBeLessThan(thresholds[thresholds.length - 1] ?? 0);
  });

  it("keeps thresholds strictly increasing for extremely small spans", () => {
    const { thresholds } = buildChoroplethSteps([0, 0.000001], ["#eee", "#ccc", "#999", "#333", "#111"], "rate");
    expect(thresholds).toHaveLength(4);
    for (let i = 1; i < thresholds.length; i += 1) {
      expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1] as number);
    }
  });

  it("transforms GeoJSON without mutating source geometries", () => {
    const original: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "BJ" },
          geometry: { type: "Point", coordinates: [116.4, 39.9] },
        },
      ],
    };
    const snapshot = structuredClone(original);
    const transformed = transformGeoJSON(original, "WGS84", "GCJ02") as GeoJSON.FeatureCollection;

    expect(original).toEqual(snapshot);
    const transformedPoint = transformed.features[0]?.geometry as GeoJSON.Point | undefined;
    expect(transformedPoint).toBeDefined();
    if (!transformedPoint) throw new Error("Expected transformed Point geometry");
    expect(transformedPoint.coordinates[0]).not.toBe(116.4);
    expect(extractGeoJSONPoints(transformed)).toHaveLength(1);
  });

  it("normalizes CSS colors and exposes zero-WebGL core entry", () => {
    expect(resolveCssColorToHex("   ", "#123456")).toBe("#123456");
    const ramp = buildAdaptiveSchemeRamp("emerald", {
      primary: "#bb4d00",
      primarySoft: "#f8a87d",
      primaryForeground: "#ffffff",
      border: "#e5e5e5",
      muted: "#f5f5f5",
      mutedForeground: "#737373",
      background: "#ffffff",
      foreground: "#171717",
      destructive: "#dc2626",
      chartColors: ["#f59e0b", "#10b981", "#ea580c", "#bb4d00", "#8b5cf6"],
      primaryRamp: ["#ffecde", "#ffd1b6", "#f8a87d", "#de793e", "#bb4d00"],
      clusterColors: ["#f8a87d", "#de793e", "#bb4d00"],
      isDark: false,
    });
    expect(ramp).toHaveLength(5);
    expect(MapCore.isValidCoordinate([116.4, 39.9])).toBe(true);
  });
});
