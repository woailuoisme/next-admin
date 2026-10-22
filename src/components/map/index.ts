// Presets & config
export {
  BASEMAP_OPTIONS,
  BASEMAP_STYLES,
  BLANK_MAP_STYLE,
  AMAP_MAP_STYLE,
  TIANDITU_MAP_STYLE,
  createAmapStyle,
  createTiandituStyle,
  resolveBasemapConfig,
  type BasemapOption,
  type BasemapPreset,
  type BasemapStyleKey,
  type BasemapConfig,
} from "./presets/basemaps";

// Coordinate transformations
export {
  type CoordinateSystem,
  transformCoordinates,
  wgs84ToGcj02,
  gcj02ToWgs84,
  gcj02ToBd09,
  bd09ToGcj02,
  wgs84ToBd09,
  bd09ToWgs84,
  isInsideChina,
} from "./utils/coordinates";

// Shared types & Feedback components
export { type Coordinates, type MapCommonProps, type MapFeedbackProps } from "./shared/types";
export { MapSkeleton, type MapSkeletonProps } from "./shared/MapSkeleton";
export { MapEmptyState, type MapEmptyStateProps } from "./shared/MapEmptyState";
export { MapAutoResizer } from "./shared/MapAutoResizer";

// Container card
export { MapCard } from "./card/MapCard";
export { type MapCardProps } from "./card/types";

// Business map components & hooks
export { LocationMarkerMap } from "./markers/LocationMarkerMap";
export { useLocationMarkers } from "./markers/useLocationMarkers";
export {
  type LocationMarkerItem,
  type LocationMarkerMapProps,
  type MarkerCategoryFilter,
} from "./markers/types";

export { RouteTrackingMap } from "./route/RouteTrackingMap";
export { useRouteTracking } from "./route/useRouteTracking";
export {
  type RouteTrackingMapProps,
  type RouteStop,
  type RouteStopStatus,
  type VehicleInfo,
} from "./route/types";

export { GeoDistributionMap } from "./geo/GeoDistributionMap";
export { useGeoDistribution, type LegendStep } from "./geo/useGeoDistribution";
export { type GeoDistributionMapProps, type ChoroplethColorScheme } from "./geo/types";

export { ArcFlightMap } from "./arc/ArcFlightMap";
export { type ArcFlightMapProps, type FlightArcItem } from "./arc/types";

export { GeoHeatmapMap } from "./heatmap/GeoHeatmapMap";
export { type GeoHeatmapMapProps, type HeatmapColorRamp, type HeatmapPoint } from "./heatmap/types";

export { LocationPicker } from "./picker/LocationPicker";
export { LocationAddressSearch } from "./picker/LocationAddressSearch";
export {
  type AmapPlace,
  type AmapSearchResult,
  describeAmapInfo,
  isAmapApiEnabled,
  reverseGeocode,
  searchPlaces,
  snapCoordinateToGrid,
  isAmapCircuitTripped,
  resetAmapCircuit,
  resetAmapCache,
  LruCache,
} from "./picker/amap-geo";
export { type LocationPickerProps, type LocationPickerValue } from "./picker/types";

// Code-split Lazy Loaders
export {
  createLazyMap,
  LazyLocationMarkerMap,
  LazyRouteTrackingMap,
  LazyGeoDistributionMap,
  LazyArcFlightMap,
  LazyGeoHeatmapMap,
  LazyLocationPicker,
} from "./lazy";
