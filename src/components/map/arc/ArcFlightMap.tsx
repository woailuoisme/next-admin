import { useMemoizedFn } from "ahooks";
import { memo, useMemo, useState } from "react";

import { Map, MapArc, type MapArcEvent, MapControls } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { ArcFlightMapProps, FlightArcItem } from "./types";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { DEFAULT_MAP_CENTER, MAP_NO_ATTRIBUTION, MAP_PRIMARY } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { ArcDetailCard } from "./ArcDetailCard";
import { ArcNodeMarker } from "./ArcNodeMarker";
import { useArcTopology } from "./useArcTopology";

export const ArcFlightMap = memo(function ArcFlightMap({
  coordinateSystem = "WGS84",
  arcs,
  curvature = 0.25,
  samples = 64,
  arcColor = MAP_PRIMARY,
  arcWidth = 2,
  arcOpacity = 0.8,
  hoverArcWidth = 3.5,
  hoverArcColor,
  showNodeMarkers = true,
  onArcClick,
  onArcHover,
  cardProps,
  center = DEFAULT_MAP_CENTER,
  zoom = 3.8,
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
}: ArcFlightMapProps) {
  const [hoveredArc, setHoveredArc] = useState<FlightArcItem | null>(null);

  const { normalizedArcs, computedCenter, uniqueNodes } = useArcTopology({
    arcs,
    center,
    coordinateSystem,
    basemap,
    showNodeMarkers,
  });

  const basemapConfig = useMemo(
    () => resolveBasemapConfig(basemap, customStyleUrl),
    [basemap, customStyleUrl],
  );

  const arcPaint = useMemo(
    () => ({
      "line-color": arcColor,
      "line-width": arcWidth,
      "line-opacity": arcOpacity,
    }),
    [arcColor, arcWidth, arcOpacity],
  );

  const arcHoverPaint = useMemo(
    () => ({
      "line-color": hoverArcColor || MAP_PRIMARY,
      "line-width": hoverArcWidth,
      "line-opacity": 1,
    }),
    [hoverArcColor, hoverArcWidth],
  );

  const hasEmptyData = isEmpty || !normalizedArcs || normalizedArcs.length === 0;

  const handleArcClick = useMemoizedFn((e: MapArcEvent<FlightArcItem>) => {
    onArcClick?.(e.arc);
  });

  const handleArcHover = useMemoizedFn((e: MapArcEvent<FlightArcItem> | null) => {
    const arc = e?.arc ?? null;
    setHoveredArc(arc);
    onArcHover?.(arc);
  });

  // 高度交由外层容器决定（卡片取 MapCard.height、全屏取 fullscreenHeight、独立使用取 wrapper），
  // 内层统一 size-full，避免内层固定高度大于外层裁切框导致底部锚定元素被裁
  const mapBody = (
    <div className={cn("relative size-full overflow-hidden rounded-xl bg-muted/20 select-none", className)}>
      {isLoading ? (
        <MapSkeleton height="100%" />
      ) : isError ? (
        <MapEmptyState
          height="100%"
          type="error"
          message={error?.message || "Failed to load flight arc data"}
          onAction={onRetry}
          actionLabel="Retry"
        />
      ) : hasEmptyData ? (
        <MapEmptyState height="100%" type="no-data" message="No flight or topology routes available" />
      ) : (
        <>
          <Map
            center={computedCenter}
            zoom={zoom}
            {...MAP_NO_ATTRIBUTION}
            styles={basemapConfig.styles}
            blank={blank || basemapConfig.blank}
            interactive={interactive}
            className="size-full"
          >
            <MapAutoResizer />
            <MapControls position="bottom-right" showZoom showCompass showLocate />

            <MapArc
              data={normalizedArcs}
              curvature={curvature}
              samples={samples}
              paint={arcPaint}
              hoverPaint={arcHoverPaint}
              onClick={handleArcClick}
              onHover={handleArcHover}
            />

            {uniqueNodes.map((node) => (
              <ArcNodeMarker key={`${node.coordinates[0]}-${node.coordinates[1]}`} node={node} />
            ))}
          </Map>

          <ArcDetailCard arc={hoveredArc} />
        </>
      )}
    </div>
  );

  if (cardProps) {
    return (
      <MapCard
        height={height}
        title={cardProps.title || "Flight & Arc Topology"}
        description={cardProps.description || "Hub-and-spoke flow and flight route network"}
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
