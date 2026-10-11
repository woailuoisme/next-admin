import type * as GeoJSON from "geojson";

import { Layers } from "lucide-react";
import { memo, useMemo } from "react";

import { Map, MapControls } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { Coordinates } from "../shared/types";
import type { GeoHeatmapMapProps } from "./types";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { MAP_NO_ATTRIBUTION } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { transformCoordinates } from "../utils/coordinates";
import { COLOR_RAMP_PRESETS } from "./colorRamps";
import { HeatmapLegend } from "./HeatmapLegend";
import { HeatmapWebGLSourceLayer } from "./HeatmapWebGLSourceLayer";
import type { HeatmapPoint } from "./types";

const EMPTY_POINTS: HeatmapPoint[] = [];
const DEFAULT_BEIJING_CENTER: Coordinates = [116.4074, 39.9042];

export const GeoHeatmapMap = memo(function GeoHeatmapMap(props: GeoHeatmapMapProps) {
  const {
    height = 500,
    zoom = 11,
    center: propCenter,
    basemap = "carto",
    customStyleUrl,
    coordinateSystem = "WGS84",
    radius = 25,
    maxIntensity = 1,
    weightProperty = "weight",
    colorRamp = "thermal",
    customColorRamp,
    opacity = 0.85,
    showLegend = true,
    legendTitle = "热力密度 (KDE)",
    cardProps,
    className,
    isLoading = false,
    isEmpty = false,
    isError = false,
    error,
    onRetry,
  } = props;

  const rawData = useMemo(() => props.data ?? props.points ?? EMPTY_POINTS, [props.data, props.points]);

  const sourceCoords = coordinateSystem;
  const targetCoords = basemap === "amap" ? "GCJ02" : "WGS84";
  const needsTransform = sourceCoords !== targetCoords;

  // Normalize data with coordinate transforms
  const normalizedPoints = useMemo(() => {
    if (!needsTransform) return rawData;
    return rawData.map((pt) => ({
      ...pt,
      coordinates: transformCoordinates(pt.coordinates, sourceCoords, targetCoords),
    }));
  }, [rawData, needsTransform, sourceCoords, targetCoords]);

  // Calculate center
  const computedCenter = useMemo<Coordinates>(() => {
    if (propCenter) {
      return needsTransform ? transformCoordinates(propCenter, sourceCoords, targetCoords) : propCenter;
    }
    if (normalizedPoints.length === 0) return DEFAULT_BEIJING_CENTER;

    let sumLng = 0;
    let sumLat = 0;
    for (const pt of normalizedPoints) {
      sumLng += pt.coordinates[0];
      sumLat += pt.coordinates[1];
    }
    return [sumLng / normalizedPoints.length, sumLat / normalizedPoints.length];
  }, [propCenter, normalizedPoints, needsTransform, sourceCoords, targetCoords]);

  // Convert points to GeoJSON FeatureCollection
  const geojsonData = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(() => {
    return {
      type: "FeatureCollection",
      features: normalizedPoints.map((pt, index) => ({
        type: "Feature",
        id: pt.id ?? index,
        properties: {
          [weightProperty]: pt.weight !== undefined ? pt.weight : 1,
          ...pt.extra,
        },
        geometry: {
          type: "Point",
          coordinates: pt.coordinates,
        },
      })),
    };
  }, [normalizedPoints, weightProperty]);

  const stops = useMemo(() => {
    return customColorRamp ?? COLOR_RAMP_PRESETS[colorRamp] ?? COLOR_RAMP_PRESETS.thermal;
  }, [colorRamp, customColorRamp]);

  const legendGradient = useMemo(() => {
    return `linear-gradient(to right, ${stops.map(([stop, color]) => `${color} ${stop * 100}%`).join(", ")})`;
  }, [stops]);

  const basemapConfig = useMemo(
    () => resolveBasemapConfig(basemap, customStyleUrl),
    [basemap, customStyleUrl],
  );
  const hasNoData = isEmpty || (!isLoading && normalizedPoints.length === 0);

  // 高度交由外层容器决定（卡片取 MapCard.height、全屏取 fullscreenHeight、独立使用取 wrapper），
  // 内层统一 size-full，避免内层固定高度大于外层裁切框导致底部锚定元素被裁
  const mapBody = (
    <div
      className={cn("relative flex size-full overflow-hidden rounded-xl bg-muted/20 select-none", className)}
    >
      {isLoading ? (
        <MapSkeleton height="100%" />
      ) : isError ? (
        <MapEmptyState
          height="100%"
          type="error"
          message={error?.message || "Failed to load heatmap data"}
          onAction={onRetry}
          actionLabel="Retry"
        />
      ) : hasNoData ? (
        <MapEmptyState height="100%" type="no-data" message="No heatmap points available" />
      ) : (
        <div className="relative h-full w-full flex-1 overflow-hidden">
          <Map
            center={computedCenter}
            zoom={zoom}
            {...MAP_NO_ATTRIBUTION}
            styles={basemapConfig.styles}
            blank={basemapConfig.blank}
            className="size-full"
          >
            <MapAutoResizer />
            <MapControls position="bottom-right" showZoom showCompass showLocate />

            <HeatmapWebGLSourceLayer
              geojsonData={geojsonData}
              radius={radius}
              maxIntensity={maxIntensity}
              weightProperty={weightProperty}
              stops={stops}
              opacity={opacity}
            />
          </Map>

          {showLegend ? (
            <HeatmapLegend
              title={legendTitle}
              pointCount={normalizedPoints.length}
              legendGradient={legendGradient}
            />
          ) : null}

          <div className="border-primary/20 bg-background/90 text-foreground absolute top-3 right-14 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur-md">
            <Layers className="text-primary size-3" />
            <span>GPU KDE 核密度渲染</span>
          </div>
        </div>
      )}
    </div>
  );

  if (cardProps) {
    return (
      <MapCard
        height={height}
        title={cardProps.title}
        description={cardProps.description}
        collapsible={cardProps.collapsible}
        fullscreenable={cardProps.fullscreenable}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={onRetry}
      >
        {mapBody}
      </MapCard>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {mapBody}
    </div>
  );
});
