"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { memo, useCallback, useMemo, useSyncExternalStore } from "react";

import { MapGeoJSON, type MapGeoJSONEvent } from "@/components/ui/map";

import type { GeoDistributionMapProps } from "./types";

import { MapFrame, useMapBasemapState } from "../frame/MapFrame";
import { CHINA_MAP_CENTER } from "../shared/constants";
import { type LeafHoverStore, useLeafHoverStore } from "../shared/useLeafHoverStore";
import { GeoDistributionHoverCard, type HoveredRegionInfo } from "./GeoDistributionHoverCard";
import { GeoDistributionLegend } from "./GeoDistributionLegend";
import { type LegendStep, useGeoDistribution } from "./useGeoDistribution";

const GeoHoverLeaf = memo(function GeoHoverLeaf({
  store,
  unit,
  showLegend,
  legendTitle,
  legendSteps,
}: {
  store: LeafHoverStore<HoveredRegionInfo>;
  unit: string;
  showLegend: boolean;
  legendTitle: string;
  legendSteps: LegendStep[];
}) {
  const hoveredInfo = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return (
    <>
      <GeoDistributionHoverCard info={hoveredInfo} unit={unit} />
      {showLegend ? <GeoDistributionLegend legendTitle={legendTitle} legendSteps={legendSteps} /> : null}
    </>
  );
});

export const GeoDistributionMap = memo(function GeoDistributionMap({
  data,
  coordinateSystem = "WGS84",
  valueKey = "value",
  labelKey = "name",
  unit = "",
  colorScheme = "primary",
  promoteId = "id",
  fillOpacity = 0.75,
  borderColor,
  borderWidth = 1,
  showLegend = true,
  legendTitle,
  onFeatureClick,
  cardProps,
  center = CHINA_MAP_CENTER,
  zoom = 3.5,
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
  height = 480,
  className,
  isLoading = false,
  isEmpty = false,
  isError = false,
  error,
  errorMessage,
  emptyMessage,
  onRetry,
}: GeoDistributionMapProps) {
  const t = useTranslations("map");
  const effectiveLegendTitle = legendTitle ?? t("geo_distribution_title");
  const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);
  const { store: hoverStore, setHovered } = useLeafHoverStore<HoveredRegionInfo>();

  const {
    resolvedData,
    fitBoundsPoints,
    legendSteps,
    fillColorExpression,
    borderColorToken,
    fetchLoading,
    fetchError,
    retryFetch,
  } = useGeoDistribution({
    data,
    valueKey,
    colorScheme,
    unit,
    coordinateSystem,
    basemap: activeBasemap,
    basemapCRS,
  });

  const fillPaint = useMemo(
    () => ({
      "fill-color": fillColorExpression,
      "fill-opacity": fillOpacity,
    }),
    [fillColorExpression, fillOpacity],
  );

  const linePaint = useMemo(
    () => ({
      "line-color": borderColor || borderColorToken,
      "line-width": borderWidth,
    }),
    [borderColor, borderColorToken, borderWidth],
  );

  const fillHoverPaint = useMemo(
    () => ({
      "fill-opacity": Math.min(1, fillOpacity + 0.25),
    }),
    [fillOpacity],
  );

  const handleHover = useMemoizedFn((e: MapGeoJSONEvent | null) => {
    if (!e || !e.feature) {
      setHovered(null);
      return;
    }
    const props = (e.feature.properties || {}) as Record<string, unknown>;
    const name = String(props[labelKey] || props.name || props.title || t("geo_region_fallback"));
    const val = props[valueKey] !== undefined ? Number(props[valueKey]) : undefined;
    setHovered({ name, value: val, properties: props });
  });

  const handleClick = useMemoizedFn((e: MapGeoJSONEvent) => {
    if (e.feature) {
      onFeatureClick?.(e.feature, (e.feature.properties || {}) as Record<string, unknown>);
    }
  });

  const combinedLoading = isLoading || fetchLoading;
  const combinedError = error ?? fetchError;
  const combinedHasError = Boolean(isError || combinedError);
  const handleCombinedRetry = useCallback(() => {
    retryFetch();
    onRetry?.();
  }, [retryFetch, onRetry]);

  const hasEmptyData =
    isEmpty || (!combinedLoading && !combinedHasError && (!resolvedData || resolvedData.features.length === 0));

  return (
    <MapFrame
      height={height}
      className={className}
      basemap={activeBasemap}
      onBasemapChange={handleBasemapChange}
      customStyleUrl={customStyleUrl}
      blank={blank}
      center={center}
      zoom={zoom}
      pitch={pitch}
      bearing={bearing}
      projection={projection}
      interactive={interactive}
      autoFitBounds={autoFitBounds}
      fitBoundsPoints={fitBoundsPoints}
      isLoading={combinedLoading}
      isEmpty={hasEmptyData}
      isError={combinedHasError}
      error={combinedError}
      errorMessage={errorMessage || (combinedHasError ? t("geo_error") : undefined)}
      emptyMessage={emptyMessage || t("geo_empty")}
      onRetry={handleCombinedRetry}
      cardProps={cardProps}
      defaultCardTitle={t("geo_distribution_title")}
      defaultCardDescription={t("geo_distribution_desc")}
      overlaySlot={
        <GeoHoverLeaf
          store={hoverStore}
          unit={unit}
          showLegend={showLegend}
          legendTitle={effectiveLegendTitle}
          legendSteps={legendSteps}
        />
      }
    >
      {resolvedData ? (
        <MapGeoJSON
          data={resolvedData}
          promoteId={promoteId}
          interactive={interactive}
          fillPaint={fillPaint}
          linePaint={linePaint}
          fillHoverPaint={fillHoverPaint}
          onHover={handleHover}
          onClick={handleClick}
        />
      ) : null}
    </MapFrame>
  );
});
