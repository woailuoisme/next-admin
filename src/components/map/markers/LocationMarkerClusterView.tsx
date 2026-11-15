"use client";

import type * as GeoJSON from "geojson";
import type * as MapLibreGL from "maplibre-gl";

import { memo, useCallback, useEffect } from "react";

import { MapClusterLayer, useMap } from "@/components/ui/map";

import type { LocationMarkerItem } from "./types";

import { useMapThemeTokens } from "../shared/tokenBridge";
import { LocationMarkerPin } from "./LocationMarkerPin";

export const CLUSTER_SAFE_TEXT_FONT = ["Noto Sans Regular"] as const;

/**
 * 将 `src/components/ui/map.tsx` 中 `MapClusterLayer` 默认的 `["Open Sans Semibold"]` 同步为
 * Carto 与 OpenFreeMap 均内置的 `["Noto Sans Regular"]`，防止聚合数字字形 PBF 404。
 */
export function syncClusterCountLayerFont(map: MapLibreGL.Map): void {
  const layers = map.getStyle?.()?.layers;
  if (!Array.isArray(layers)) return;

  for (const layer of layers) {
    if (layer.type === "symbol" && layer.id.startsWith("cluster-count-")) {
      const currentFont = map.getLayoutProperty?.(layer.id, "text-font");
      if (!Array.isArray(currentFont) || currentFont[0] !== CLUSTER_SAFE_TEXT_FONT[0]) {
        map.setLayoutProperty?.(layer.id, "text-font", [...CLUSTER_SAFE_TEXT_FONT]);
      }
    }
  }
}

interface LocationMarkerClusterViewProps {
  geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point>;
  enableClustering: boolean;
  clusterRadius: number;
  clusterMaxZoom: number;
  filteredLookup: Map<string, LocationMarkerItem>;
  selectedMarker: LocationMarkerItem | null;
  onSelectMarker: (item: LocationMarkerItem | null) => void;
  renderPopup?: (item: LocationMarkerItem) => React.ReactNode;
}

export const LocationMarkerClusterView = memo(function LocationMarkerClusterView({
  geojsonData,
  enableClustering,
  clusterRadius,
  clusterMaxZoom,
  filteredLookup,
  selectedMarker,
  onSelectMarker,
  renderPopup,
}: LocationMarkerClusterViewProps) {
  const { map, isLoaded } = useMap();
  const tokens = useMapThemeTokens();

  useEffect(() => {
    if (!isLoaded || !map) return;

    const handleSyncFont = () => {
      syncClusterCountLayerFont(map);
    };

    handleSyncFont();
    map.on?.("styledata", handleSyncFont);
    return () => {
      map.off?.("styledata", handleSyncFont);
    };
  }, [isLoaded, map, enableClustering, clusterRadius, clusterMaxZoom]);

  const handlePointClick = useCallback(
    (feature: GeoJSON.Feature) => {
      const featureId = feature.properties?.id;
      const item = featureId !== undefined ? filteredLookup.get(String(featureId)) : undefined;
      if (item) onSelectMarker(item);
    },
    [filteredLookup, onSelectMarker],
  );

  return (
    <>
      <MapClusterLayer
        key={`cluster-${enableClustering}-${clusterRadius}-${clusterMaxZoom}`}
        data={geojsonData}
        clusterRadius={enableClustering ? clusterRadius : 1}
        clusterMaxZoom={clusterMaxZoom}
        clusterColors={tokens.clusterColors}
        pointColor={tokens.primary}
        onPointClick={handlePointClick}
      />

      {/* Promote selected marker to interactive DOM marker with pulse & popup */}
      {selectedMarker ? (
        <LocationMarkerPin
          key={`canvas-selected-${selectedMarker.id}`}
          item={selectedMarker}
          isSelected={true}
          onSelect={onSelectMarker}
          renderPopup={renderPopup}
        />
      ) : null}
    </>
  );
});
