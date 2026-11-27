"use client";

import type * as GeoJSON from "geojson";

import { useFormatter } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import type { BasemapPreset } from "../presets/basemaps";
import type { ChoroplethColorScheme, GeoDistributionMapProps } from "./types";
import type { CoordinateSystem } from "../utils/coordinates";

import { LruCache } from "../shared/lruCache";
import { buildAdaptiveSchemeRamp, useMapThemeTokens } from "../shared/tokenBridge";
import { resolveCoordinateSystems } from "../utils/coordinates";
import {
  buildChoroplethSteps,
  type ChoroplethLegendStep,
  extractGeoJSONPoints,
  parseFiniteMetricValue,
  transformGeoJSON,
} from "../utils/geoEngine";

export type LegendStep = ChoroplethLegendStep;

const geojsonUrlCache = new LruCache<string, GeoJSON.FeatureCollection>(20);

function normalizeToFeatureCollection(
  raw: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.GeoJSON | null | undefined,
): GeoJSON.FeatureCollection | null {
  if (!raw || typeof raw !== "object" || !("type" in raw)) return null;
  if (raw.type === "FeatureCollection") return raw as GeoJSON.FeatureCollection;
  if (raw.type === "Feature") {
    return { type: "FeatureCollection", features: [raw as GeoJSON.Feature] };
  }
  return null;
}

export function useGeoDistribution({
  data,
  valueKey = "value",
  colorScheme = "primary",
  unit = "",
  coordinateSystem = "WGS84",
  basemap = "carto",
  basemapCRS,
}: Pick<GeoDistributionMapProps, "data" | "valueKey" | "colorScheme" | "unit" | "coordinateSystem" | "basemapCRS"> & {
  basemap?: BasemapPreset;
}) {
  const formatter = useFormatter();
  const tokens = useMapThemeTokens();

  const isUrl = typeof data === "string";
  const urlString = isUrl ? data : null;
  const cachedUrlData = urlString ? (geojsonUrlCache.get(urlString) ?? null) : null;

  const [fetchState, setFetchState] = useState<{
    url: string;
    nonce: number;
    data: GeoJSON.FeatureCollection | null;
    error: Error | null;
  } | null>(null);
  const [fetchNonce, setFetchNonce] = useState(0);

  const retryFetch = () => {
    if (urlString) {
      geojsonUrlCache.delete(urlString);
      setFetchNonce((n) => n + 1);
    }
  };

  useEffect(() => {
    if (!urlString) return;

    const cached = geojsonUrlCache.get(urlString);
    if (cached) return;

    const controller = new AbortController();

    fetch(urlString, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch GeoJSON (${res.status})`);
        }
        return (await res.json()) as GeoJSON.GeoJSON;
      })
      .then((json) => {
        const normalized = normalizeToFeatureCollection(json);
        if (!normalized) {
          throw new Error("Invalid GeoJSON FeatureCollection response");
        }
        geojsonUrlCache.set(urlString, normalized);
        setFetchState({ url: urlString, nonce: fetchNonce, data: normalized, error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFetchState({
          url: urlString,
          nonce: fetchNonce,
          data: null,
          error: err instanceof Error ? err : new Error("Failed to fetch GeoJSON"),
        });
      });

    return () => {
      controller.abort();
    };
  }, [urlString, fetchNonce]);

  const activeFetchMatch =
    urlString && fetchState?.url === urlString && fetchState.nonce === fetchNonce ? fetchState : null;
  const fetchedGeojson = urlString ? (cachedUrlData ?? activeFetchMatch?.data ?? null) : null;
  const fetchError = urlString ? (activeFetchMatch?.error ?? null) : null;
  const fetchLoading = Boolean(urlString && !cachedUrlData && !activeFetchMatch);

  const rawFeatureCollection = isUrl ? fetchedGeojson : normalizeToFeatureCollection(data);

  const { sourceCoords, targetCoords, needsTransform } = resolveCoordinateSystems(
    coordinateSystem as CoordinateSystem,
    basemap,
    basemapCRS,
  );

  // 避免大体积 GeoJSON 多边形坐标转换在无关渲染时重复执行
  const resolvedData = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!rawFeatureCollection) return null;
    if (!needsTransform) return rawFeatureCollection;
    return transformGeoJSON(rawFeatureCollection, sourceCoords, targetCoords);
  }, [rawFeatureCollection, needsTransform, sourceCoords, targetCoords]);

  const fitBoundsPoints = resolvedData ? extractGeoJSONPoints(resolvedData) : [];

  const colors = buildAdaptiveSchemeRamp(colorScheme as ChoroplethColorScheme, tokens);

  // 避免分级设色区间扫描与 MapLibre step 表达式重复构建
  const { min, max, thresholds, legendSteps, fillColorExpression } = useMemo(() => {
    const rawValues = resolvedData
      ? resolvedData.features
          .map((f) => parseFiniteMetricValue(f.properties?.[valueKey]))
          .filter((v): v is number => v !== undefined)
      : [];

    return buildChoroplethSteps(rawValues, colors, valueKey, unit, (v) =>
      formatter.number(v, { maximumFractionDigits: 3 }),
    );
  }, [resolvedData, valueKey, colors, unit, formatter]);

  return {
    resolvedData,
    fitBoundsPoints,
    min,
    max,
    thresholds,
    legendSteps,
    fillColorExpression,
    borderColorToken: tokens.border,
    fetchLoading,
    fetchError,
    retryFetch,
  };
}
