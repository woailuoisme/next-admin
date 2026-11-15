"use client";

import type * as GeoJSON from "geojson";

import { useFormatter } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { BasemapPreset } from "../presets/basemaps";
import type { ChoroplethColorScheme, GeoDistributionMapProps } from "./types";
import type { CoordinateSystem } from "../utils/coordinates";

import { buildAdaptiveSchemeRamp, useMapThemeTokens } from "../shared/tokenBridge";
import { resolveCoordinateSystems } from "../utils/coordinates";
import {
  buildChoroplethSteps,
  type ChoroplethLegendStep,
  extractGeoJSONPoints,
  transformGeoJSON,
} from "../utils/geoEngine";

export type LegendStep = ChoroplethLegendStep;

const geojsonUrlCache = new Map<string, GeoJSON.FeatureCollection>();

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

  const retryFetch = useCallback(() => {
    if (urlString) {
      geojsonUrlCache.delete(urlString);
      setFetchNonce((n) => n + 1);
    }
  }, [urlString]);

  useEffect(() => {
    if (!urlString) return;

    const cached = geojsonUrlCache.get(urlString);
    if (cached && fetchNonce === 0) return;

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

  const rawFeatureCollection = useMemo(() => {
    if (isUrl) return fetchedGeojson;
    return normalizeToFeatureCollection(data);
  }, [isUrl, fetchedGeojson, data]);

  const { sourceCoords, targetCoords, needsTransform } = resolveCoordinateSystems(
    coordinateSystem as CoordinateSystem,
    basemap,
    basemapCRS,
  );

  const resolvedData = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!rawFeatureCollection) return null;
    if (!needsTransform) return rawFeatureCollection;
    return transformGeoJSON(rawFeatureCollection, sourceCoords, targetCoords);
  }, [rawFeatureCollection, needsTransform, sourceCoords, targetCoords]);

  const fitBoundsPoints = useMemo(() => (resolvedData ? extractGeoJSONPoints(resolvedData) : []), [resolvedData]);

  const colors = useMemo(
    () => buildAdaptiveSchemeRamp(colorScheme as ChoroplethColorScheme, tokens),
    [colorScheme, tokens],
  );

  const { min, max, thresholds, legendSteps, fillColorExpression } = useMemo(() => {
    const rawValues = resolvedData ? resolvedData.features.map((f) => Number(f.properties?.[valueKey])) : [];

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
