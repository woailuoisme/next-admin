"use client";

import { useTranslations } from "next-intl";
import { Cpu } from "lucide-react";
import { memo, useMemo } from "react";

import { Badge } from "@/components/ui/badge";

import type { LocationMarkerMapProps } from "./types";

import { MapFrame, useMapBasemapState } from "../frame/MapFrame";
import { MapFlyTo } from "../shared/MapFlyTo";
import { LocationMarkerClusterView } from "./LocationMarkerClusterView";
import { LocationMarkerPin } from "./LocationMarkerPin";
import { LocationMarkerSearchOverlay } from "./LocationMarkerSearchOverlay";
import { LocationMarkerMobileDrawer, LocationMarkerSidebar } from "./LocationMarkerSidebar";
import { useLocationMarkers } from "./useLocationMarkers";

export const LocationMarkerMap = memo(function LocationMarkerMap(props: LocationMarkerMapProps) {
  const t = useTranslations("map");
  const {
    height = 500,
    zoom = 11,
    pitch,
    bearing,
    interactive = true,
    projection,
    blank = false,
    autoFitBounds = false,
    basemap = "carto",
    basemapCRS,
    onBasemapChange,
    customStyleUrl,
    renderMode = "auto",
    tierThreshold = 200,
    enableClustering = true,
    clusterRadius = 50,
    clusterMaxZoom = 14,
    showSearch = true,
    searchPlaceholder,
    showCategoryFilter = true,
    showSidebarList = false,
    renderPopup,
    className,
    isLoading = false,
    isEmpty = false,
    isError = false,
    error,
    errorMessage,
    emptyMessage,
    onRetry,
    cardProps,
  } = props;

  const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);

  const {
    totalCount,
    searchQuery,
    deferredSearchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    categoryCounts,
    filteredData,
    filteredLookup,
    filteredPoints,
    geojsonData,
    computedCenter,
    selectedMarker,
    handleSelectMarker,
  } = useLocationMarkers({ ...props, activeBasemap, basemapCRS });

  const hasNoData = isEmpty || (!isLoading && filteredData.length === 0 && !deferredSearchQuery);
  const isCanvasTier = renderMode === "canvas" || (renderMode === "auto" && filteredData.length >= tierThreshold);

  const overlaySlot = useMemo(
    () => (
      <>
        {isCanvasTier ? (
          <Badge
            variant="secondary"
            className="border-primary/20 bg-background/90 text-foreground absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-xs backdrop-blur-md"
          >
            <Cpu className="text-primary size-3 animate-pulse" />
            <span>{t("markers_gpu_badge", { count: filteredData.length })}</span>
          </Badge>
        ) : null}

        <LocationMarkerSearchOverlay
          showSearch={showSearch}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={searchPlaceholder}
          showCategoryFilter={showCategoryFilter}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalCount={totalCount}
          categoryCounts={categoryCounts}
        />

        {showSidebarList ? (
          <LocationMarkerMobileDrawer
            filteredData={filteredData}
            selectedMarker={selectedMarker}
            onSelectMarker={handleSelectMarker}
          />
        ) : null}
      </>
    ),
    [
      isCanvasTier,
      t,
      filteredData,
      showSearch,
      searchQuery,
      setSearchQuery,
      searchPlaceholder,
      showCategoryFilter,
      categories,
      selectedCategory,
      setSelectedCategory,
      totalCount,
      categoryCounts,
      showSidebarList,
      selectedMarker,
      handleSelectMarker,
    ],
  );

  const afterMapSlot = showSidebarList ? (
    <LocationMarkerSidebar
      filteredData={filteredData}
      selectedMarker={selectedMarker}
      onSelectMarker={handleSelectMarker}
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
      interactive={interactive}
      projection={projection}
      autoFitBounds={autoFitBounds}
      fitBoundsPoints={filteredPoints}
      isLoading={isLoading}
      isEmpty={hasNoData}
      isError={isError}
      error={error}
      errorMessage={errorMessage}
      emptyMessage={emptyMessage ?? t("markers_empty")}
      onRetry={onRetry}
      cardProps={cardProps}
      defaultCardTitle={t("markers_card_title")}
      defaultCardDescription={t("markers_card_desc")}
      overlaySlot={overlaySlot}
      afterMapSlot={afterMapSlot}
    >
      <MapFlyTo target={selectedMarker?.coordinates ?? null} minZoom={13} />

      {isCanvasTier ? (
        <LocationMarkerClusterView
          geojsonData={geojsonData}
          enableClustering={enableClustering}
          clusterRadius={clusterRadius}
          clusterMaxZoom={clusterMaxZoom}
          filteredLookup={filteredLookup}
          selectedMarker={selectedMarker}
          onSelectMarker={handleSelectMarker}
          renderPopup={renderPopup}
        />
      ) : (
        filteredData.map((item) => (
          <LocationMarkerPin
            key={item.id}
            item={item}
            isSelected={selectedMarker?.id === item.id}
            onSelect={handleSelectMarker}
            renderPopup={renderPopup}
          />
        ))
      )}
    </MapFrame>
  );
});
