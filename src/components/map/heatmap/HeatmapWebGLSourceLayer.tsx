import type * as GeoJSON from "geojson";
import type { GeoJSONSource } from "maplibre-gl";

import { useEffect, useId, useRef } from "react";

import { useMap } from "@/components/ui/map";

import { buildHeatmapColorExpression, EMPTY_HEATMAP_GEOJSON } from "./colorRamps";

interface HeatmapWebGLSourceLayerProps {
  geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point>;
  radius: number;
  maxIntensity: number;
  weightProperty: string;
  stops: Array<[number, string]>;
  opacity: number;
}

/**
 * Headless Heatmap WebGL Layer Component
 */
export function HeatmapWebGLSourceLayer({
  geojsonData,
  radius,
  maxIntensity,
  weightProperty,
  stops,
  opacity,
}: HeatmapWebGLSourceLayerProps) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `heatmap-src-${id.replace(/:/g, "")}`;
  const layerId = `heatmap-layer-${id.replace(/:/g, "")}`;
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !map) return;

    // Clean up existing if any
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    const colorExpr = buildHeatmapColorExpression(stops);

    // Register GeoJSON Source
    map.addSource(sourceId, {
      type: "geojson",
      data: EMPTY_HEATMAP_GEOJSON,
    });

    // Register Heatmap Layer
    map.addLayer({
      id: layerId,
      type: "heatmap",
      source: sourceId,
      maxzoom: 19,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["get", weightProperty], 0, 0, maxIntensity, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 2, 15, 3],
        "heatmap-color": colorExpr,
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, radius, 15, radius * 2],
        "heatmap-opacity": opacity,
      },
    });

    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {}
    };
  }, [isLoaded, map, sourceId, layerId, radius, maxIntensity, weightProperty, stops, opacity]);

  // Update data seamlessly without rebuilding layer
  useEffect(() => {
    if (!isMountedRef.current || !map || !isLoaded) return;
    const source = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (source?.setData) {
      source.setData(geojsonData);
    }
  }, [geojsonData, map, isLoaded, sourceId]);

  return null;
}
