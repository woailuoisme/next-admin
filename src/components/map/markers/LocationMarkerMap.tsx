import { Cpu } from "lucide-react";
import { memo, useDeferredValue, useMemo } from "react";

import { Map, MapControls } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { LocationMarkerItem, LocationMarkerMapProps } from "./types";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { MAP_NO_ATTRIBUTION } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapFlyTo } from "../shared/MapFlyTo";
import { MapSkeleton } from "../shared/MapSkeleton";
import { LocationMarkerClusterView } from "./LocationMarkerClusterView";
import { LocationMarkerPin } from "./LocationMarkerPin";
import { LocationMarkerSearchOverlay } from "./LocationMarkerSearchOverlay";
import { LocationMarkerSidebar } from "./LocationMarkerSidebar";
import { useLocationMarkers } from "./useLocationMarkers";

const EMPTY_MARKERS: LocationMarkerItem[] = [];

export const LocationMarkerMap = memo(function LocationMarkerMap(props: LocationMarkerMapProps) {
  const {
    height = 500,
    zoom = 11,
    basemap = "carto",
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
    onRetry,
    cardProps,
  } = props;

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredData,
    geojsonData,
    computedCenter,
    selectedMarker,
    handleSelectMarker,
  } = useLocationMarkers(props);

  // Deferred search query for smooth UI response during fast typing
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const rawItems = useMemo(() => props.data ?? props.locations ?? EMPTY_MARKERS, [props.data, props.locations]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of rawItems) {
      if (item.category) {
        counts[item.category] = (counts[item.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [rawItems]);

  const basemapConfig = useMemo(() => resolveBasemapConfig(basemap, customStyleUrl), [basemap, customStyleUrl]);
  const hasNoData = isEmpty || (!isLoading && filteredData.length === 0 && !deferredSearchQuery);
  const isCanvasTier = renderMode === "canvas" || (renderMode === "auto" && filteredData.length >= tierThreshold);

  // 高度交由外层容器决定（卡片取 MapCard.height、全屏取 fullscreenHeight、独立使用取 wrapper），
  // 内层统一 size-full，避免内层固定高度大于外层裁切框导致搜索浮层/控件被裁
  const mapBody = (
    <div className={cn("relative flex size-full overflow-hidden rounded-xl bg-muted/20 select-none", className)}>
      {isLoading ? (
        <MapSkeleton height="100%" />
      ) : isError ? (
        <MapEmptyState
          height="100%"
          type="error"
          message={error?.message || "Failed to load location markers"}
          onAction={onRetry}
          actionLabel="Retry"
        />
      ) : hasNoData ? (
        <MapEmptyState height="100%" type="no-data" message="No location markers found" />
      ) : (
        <>
          {/* Main Map View Area */}
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
              <MapFlyTo target={selectedMarker?.coordinates ?? null} minZoom={13} />
              <MapControls position="bottom-right" showZoom showCompass showLocate />

              {isCanvasTier ? (
                <LocationMarkerClusterView
                  geojsonData={geojsonData}
                  enableClustering={enableClustering}
                  clusterRadius={clusterRadius}
                  clusterMaxZoom={clusterMaxZoom}
                  filteredData={filteredData}
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
            </Map>

            {isCanvasTier ? (
              <div className="border-primary/20 bg-background/90 text-foreground absolute top-3 right-14 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur-md">
                <Cpu className="text-primary size-3 animate-pulse" />
                <span>GPU 矢量加速 ({filteredData.length} 点)</span>
              </div>
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
              totalCount={rawItems.length}
              categoryCounts={categoryCounts}
            />
          </div>

          {showSidebarList ? (
            <LocationMarkerSidebar
              filteredData={filteredData}
              selectedMarker={selectedMarker}
              onSelectMarker={handleSelectMarker}
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
        title={cardProps.title || "Location Network Map"}
        description={cardProps.description || "Geographical distribution and site details"}
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
