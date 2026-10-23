import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { Map, MapControls, MapRoute, RouteProgress } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { RouteTrackingMapProps } from "./types";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { EMPTY_STOPS, MAP_NO_ATTRIBUTION, MAP_PRIMARY, MAP_PRIMARY_SOFT } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { resolveCoordinateSystems, transformCoordinates } from "../utils/coordinates";
import { RoutePlaybackScrubber } from "./RoutePlaybackScrubber";
import { StopMarker } from "./StopMarker";
import { useRouteTracking } from "./useRouteTracking";
import { VehicleMarker } from "./VehicleMarker";

const DEFAULT_BEIJING_CENTER: [number, number] = [116.4074, 39.9042];

export const RouteTrackingMap = memo(function RouteTrackingMap({
  coordinateSystem = "WGS84",
  coordinates,
  stops = EMPTY_STOPS,
  vehicle,
  progress: controlledProgress,
  defaultProgress = 0,
  onProgressChange,
  autoPlay = false,
  playbackDuration = 15,
  showScrubber = true,
  routeColor = MAP_PRIMARY_SOFT,
  traveledColor = MAP_PRIMARY,
  routeWidth = 4,
  onStopClick,
  cardProps,
  center,
  zoom = 12,
  basemap = "carto",
  customStyleUrl,
  blank = false,
  interactive = true,
  height = 460,
  className,
  isLoading = false,
  isEmpty = false,
  isError = false,
  error,
  errorMessage,
  emptyMessage,
  onRetry,
}: RouteTrackingMapProps) {
  const t = useTranslations("map");
  const { sourceCoords, targetCoords, needsTransform } = resolveCoordinateSystems(coordinateSystem, basemap);

  const normalizedCoordinates = useMemo(() => {
    if (!needsTransform) return coordinates;
    return coordinates.map((c) => transformCoordinates(c, sourceCoords, targetCoords));
  }, [coordinates, needsTransform, sourceCoords, targetCoords]);

  const normalizedStops = useMemo(() => {
    if (!needsTransform) return stops;
    return stops.map((s) => ({
      ...s,
      coordinates: transformCoordinates(s.coordinates, sourceCoords, targetCoords),
    }));
  }, [stops, needsTransform, sourceCoords, targetCoords]);

  const { progress, isPlaying, togglePlay, seekTo, reset, enrichedStops } = useRouteTracking({
    coordinates: normalizedCoordinates,
    stops: normalizedStops,
    progress: controlledProgress,
    defaultProgress,
    onProgressChange,
    autoPlay,
    playbackDuration,
  });

  const computedCenter = useMemo<[number, number]>(() => {
    if (center) {
      return needsTransform ? transformCoordinates(center, sourceCoords, targetCoords) : center;
    }
    if (normalizedCoordinates.length > 0) {
      return normalizedCoordinates[0];
    }
    return DEFAULT_BEIJING_CENTER;
  }, [center, normalizedCoordinates, needsTransform, sourceCoords, targetCoords]);

  const basemapConfig = useMemo(() => resolveBasemapConfig(basemap, customStyleUrl), [basemap, customStyleUrl]);

  const hasEmptyData = isEmpty || normalizedCoordinates.length < 2;

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
          message={error?.message || errorMessage || t("route_error")}
          onAction={onRetry}
          actionLabel={t("retry")}
        />
      ) : hasEmptyData ? (
        <MapEmptyState height="100%" type="no-data" message={emptyMessage || t("route_empty")} />
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

            <MapRoute coordinates={normalizedCoordinates} color={routeColor} width={routeWidth} progress={progress}>
              <RouteProgress color={traveledColor} width={routeWidth + 1} />
              <VehicleMarker vehicle={vehicle} progress={progress} />
            </MapRoute>

            {enrichedStops.map((stop) => (
              <StopMarker key={stop.id} stop={stop} onStopClick={onStopClick} />
            ))}
          </Map>

          {showScrubber ? (
            <RoutePlaybackScrubber
              isPlaying={isPlaying}
              progress={progress}
              onTogglePlay={togglePlay}
              onReset={reset}
              onSeek={seekTo}
              vehicle={vehicle}
            />
          ) : null}
        </>
      )}
    </div>
  );

  if (cardProps) {
    return (
      <MapCard
        height={height}
        title={cardProps.title || t("route_card_title")}
        description={cardProps.description || t("route_card_desc")}
        fullscreenable={cardProps.fullscreenable}
        isLoading={isLoading}
        isError={isError}
        error={error}
        errorMessage={errorMessage}
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
