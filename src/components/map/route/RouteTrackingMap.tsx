"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo, useSyncExternalStore } from "react";

import { MapRoute, RouteProgress } from "@/components/ui/map";

import type { Coordinates } from "../shared/types";
import type { RouteTrackingMapProps, VehicleInfo } from "./types";

import { MapFrame, useMapBasemapState } from "../frame/MapFrame";
import { DEFAULT_BEIJING_CENTER, EMPTY_STOPS } from "../shared/constants";
import { useMapThemeTokens } from "../shared/tokenBridge";
import { isValidCoordinate, resolveCoordinateSystems, transformCoordinates } from "../utils/coordinates";
import { resolveBoundingCenter } from "../utils/geoEngine";
import { RoutePlaybackScrubber } from "./RoutePlaybackScrubber";
import { StopMarker } from "./StopMarker";
import { type RouteProgressStore, useRouteTracking } from "./useRouteTracking";
import { VehicleMarker } from "./VehicleMarker";

interface RouteAnimatedLayerProps {
  coordinates: Coordinates[];
  routeColor: string;
  traveledColor: string;
  routeWidth: number;
  vehicle?: VehicleInfo;
  progressStore: RouteProgressStore;
}

/** 仅此叶子节点订阅 60fps progress，隔离 MapFrame 与 StopMarker 的 React 调和 */
const RouteAnimatedLayer = memo(function RouteAnimatedLayer({
  coordinates,
  routeColor,
  traveledColor,
  routeWidth,
  vehicle,
  progressStore,
}: RouteAnimatedLayerProps) {
  const progress = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot,
  );

  return (
    <MapRoute coordinates={coordinates} color={routeColor} width={routeWidth} progress={progress}>
      <RouteProgress color={traveledColor} width={routeWidth + 1} />
      <VehicleMarker vehicle={vehicle} progress={progress} />
    </MapRoute>
  );
});

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
  routeColor,
  traveledColor,
  routeWidth = 4,
  onStopClick,
  cardProps,
  center,
  zoom = 12,
  pitch,
  bearing,
  projection,
  basemap = "carto",
  basemapCRS,
  onBasemapChange,
  customStyleUrl,
  blank = false,
  interactive = true,
  autoFitBounds = false,
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
  const tokens = useMapThemeTokens();
  const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);

  const { sourceCoords, targetCoords, needsTransform } = resolveCoordinateSystems(
    coordinateSystem,
    activeBasemap,
    basemapCRS,
  );

  const normalizedCoordinates = useMemo(() => {
    const valid = coordinates.filter((c) => isValidCoordinate(c));
    if (!needsTransform) return valid;
    return valid.map((c) => transformCoordinates(c, sourceCoords, targetCoords));
  }, [coordinates, needsTransform, sourceCoords, targetCoords]);

  const normalizedStops = useMemo(() => {
    const valid = stops.filter((s) => isValidCoordinate(s.coordinates));
    if (!needsTransform) return valid;
    return valid.map((s) => ({
      ...s,
      coordinates: transformCoordinates(s.coordinates, sourceCoords, targetCoords),
    }));
  }, [stops, needsTransform, sourceCoords, targetCoords]);

  const hasEmptyData = isEmpty || normalizedCoordinates.length < 2;
  const playbackEnabled = !isLoading && !isError && !hasEmptyData;

  const { progressStore, isPlaying, togglePlay, seekTo, reset, enrichedStops } = useRouteTracking({
    coordinates: normalizedCoordinates,
    stops: normalizedStops,
    progress: controlledProgress,
    defaultProgress,
    onProgressChange,
    autoPlay,
    playbackDuration,
    enabled: playbackEnabled,
  });

  const computedCenter = useMemo<Coordinates>(() => {
    const explicit =
      center && isValidCoordinate(center)
        ? needsTransform
          ? transformCoordinates(center, sourceCoords, targetCoords)
          : center
        : undefined;
    return resolveBoundingCenter(normalizedCoordinates, explicit, DEFAULT_BEIJING_CENTER);
  }, [center, normalizedCoordinates, needsTransform, sourceCoords, targetCoords]);

  const effectiveRouteColor = routeColor || tokens.primarySoft;
  const effectiveTraveledColor = traveledColor || tokens.primary;

  const overlaySlot = showScrubber ? (
    <RoutePlaybackScrubber
      isPlaying={isPlaying}
      progressStore={progressStore}
      onTogglePlay={togglePlay}
      onReset={reset}
      onSeek={seekTo}
      vehicle={vehicle}
    />
  ) : null;

  return (
    <MapFrame
      height={height}
      className={className}
      basemap={activeBasemap}
      onBasemapChange={handleBasemapChange}
      customStyleUrl={customStyleUrl}
      blank={blank}
      center={computedCenter}
      zoom={zoom}
      pitch={pitch}
      bearing={bearing}
      projection={projection}
      interactive={interactive}
      autoFitBounds={autoFitBounds}
      fitBoundsPoints={normalizedCoordinates}
      isLoading={isLoading}
      isEmpty={hasEmptyData}
      isError={isError}
      error={error}
      errorMessage={errorMessage || (isError ? t("route_error") : undefined)}
      emptyMessage={emptyMessage || t("route_empty")}
      onRetry={onRetry}
      cardProps={cardProps}
      defaultCardTitle={t("route_card_title")}
      defaultCardDescription={t("route_card_desc")}
      overlaySlot={overlaySlot}
    >
      <RouteAnimatedLayer
        coordinates={normalizedCoordinates}
        routeColor={effectiveRouteColor}
        traveledColor={effectiveTraveledColor}
        routeWidth={routeWidth}
        vehicle={vehicle}
        progressStore={progressStore}
      />

      {enrichedStops.map((stop) => (
        <StopMarker key={stop.id} stop={stop} onStopClick={onStopClick} />
      ))}
    </MapFrame>
  );
});
