import { useMemoizedFn } from "ahooks";
import { memo, useMemo, useState } from "react";

import { Map, MapControls, MapGeoJSON, type MapGeoJSONEvent } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { GeoDistributionMapProps } from "./types";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { CHINA_MAP_CENTER, MAP_NO_ATTRIBUTION, MAP_REGION_BORDER } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { GeoDistributionHoverCard } from "./GeoDistributionHoverCard";
import { GeoDistributionLegend } from "./GeoDistributionLegend";
import { useGeoDistribution } from "./useGeoDistribution";

export const GeoDistributionMap = memo(function GeoDistributionMap({
  data,
  valueKey = "value",
  labelKey = "name",
  unit = "",
  colorScheme = "primary",
  promoteId = "id",
  fillOpacity = 0.75,
  borderColor,
  borderWidth = 1,
  showLegend = true,
  legendTitle = "Metric Distribution",
  onFeatureClick,
  cardProps,
  center = CHINA_MAP_CENTER,
  zoom = 3.5,
  basemap = "carto",
  customStyleUrl,
  blank = false,
  interactive = true,
  height = 480,
  className,
  isLoading = false,
  isEmpty = false,
  isError = false,
  error,
  onRetry,
}: GeoDistributionMapProps) {
  const [hoveredInfo, setHoveredInfo] = useState<{
    name: string;
    value?: number;
    properties: Record<string, unknown>;
  } | null>(null);

  const { legendSteps, fillColorExpression } = useGeoDistribution({
    data,
    valueKey,
    colorScheme,
    unit,
  });

  const basemapConfig = useMemo(() => resolveBasemapConfig(basemap, customStyleUrl), [basemap, customStyleUrl]);

  const fillPaint = useMemo(
    () => ({
      "fill-color": fillColorExpression,
      "fill-opacity": fillOpacity,
    }),
    [fillColorExpression, fillOpacity],
  );

  const linePaint = useMemo(
    () => ({
      "line-color": borderColor || MAP_REGION_BORDER,
      "line-width": borderWidth,
    }),
    [borderColor, borderWidth],
  );

  const fillHoverPaint = useMemo(
    () => ({
      "fill-opacity": Math.min(1, fillOpacity + 0.25),
    }),
    [fillOpacity],
  );

  const handleHover = useMemoizedFn((e: MapGeoJSONEvent | null) => {
    if (!e || !e.feature) {
      setHoveredInfo(null);
      return;
    }
    const props = (e.feature.properties || {}) as Record<string, unknown>;
    const name = String(props[labelKey] || props.name || props.title || "Region");
    const val = props[valueKey] !== undefined ? Number(props[valueKey]) : undefined;
    setHoveredInfo({ name, value: val, properties: props });
  });

  const handleClick = useMemoizedFn((e: MapGeoJSONEvent) => {
    if (e.feature) {
      onFeatureClick?.(e.feature, (e.feature.properties || {}) as Record<string, unknown>);
    }
  });

  const hasEmptyData =
    isEmpty ||
    !data ||
    (typeof data === "object" && "features" in data && (data as GeoJSON.FeatureCollection).features.length === 0);

  // 高度交由外层容器决定：卡片模式取 MapCard.height、全屏取 fullscreenHeight、
  // 独立使用时由下方 wrapper 提供。内层统一 size-full，避免内层固定高度大于
  // 外层裁切框（原为 480 vs 450）导致底部锚定的图例与控件被裁切
  const mapBody = (
    <div className={cn("relative size-full overflow-hidden rounded-xl bg-muted/20 select-none", className)}>
      {isLoading ? (
        <MapSkeleton height="100%" />
      ) : isError ? (
        <MapEmptyState
          height="100%"
          type="error"
          message={error?.message || "Failed to load geo distribution data"}
          onAction={onRetry}
          actionLabel="Retry"
        />
      ) : hasEmptyData ? (
        <MapEmptyState height="100%" type="no-data" message="No geographical distribution data available" />
      ) : (
        <>
          <Map
            center={center}
            zoom={zoom}
            {...MAP_NO_ATTRIBUTION}
            styles={basemapConfig.styles}
            blank={blank || basemapConfig.blank}
            interactive={interactive}
            className="size-full"
          >
            <MapAutoResizer />
            <MapControls position="bottom-right" showZoom showCompass showLocate />

            <MapGeoJSON
              data={data}
              promoteId={promoteId}
              interactive={true}
              fillPaint={fillPaint}
              linePaint={linePaint}
              fillHoverPaint={fillHoverPaint}
              onHover={handleHover}
              onClick={handleClick}
            />
          </Map>

          <GeoDistributionHoverCard info={hoveredInfo} unit={unit} />

          {showLegend ? <GeoDistributionLegend legendTitle={legendTitle} legendSteps={legendSteps} /> : null}
        </>
      )}
    </div>
  );

  if (cardProps) {
    return (
      <MapCard
        height={height}
        title={cardProps.title || "Regional Distribution"}
        description={cardProps.description || "Geospatial data density and regional metrics"}
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
