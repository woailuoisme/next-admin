/**
 * 地图模块总出口（为兼容既有导入保留全量重导出）。
 * 页面与交互场景请优先从 `@/components/map/lazy` 导入 `Lazy*` 异步包装组件以避免将 `maplibre-gl` 打入首屏 Bundle；
 * 纯逻辑/类型/坐标转换请优先从 `@/components/map/core` 导入。
 */
export * from "./core";

export { MapCard } from "./card/MapCard";
export type { MapCardProps } from "./card/types";
export { MapBasemapDropdown, type MapBasemapDropdownProps } from "./card/MapBasemapDropdown";
export { MapFullscreenDialog, type MapFullscreenDialogProps } from "./card/MapFullscreenDialog";

export { MapFrame, useMapBasemapState, type MapFrameProps } from "./frame/MapFrame";

export { CHINA_MAP_CENTER, DEFAULT_BEIJING_CENTER, MAP_ATTRIBUTION_PROPS } from "./shared/constants";
export { MapSkeleton, type MapSkeletonProps } from "./shared/MapSkeleton";
export { MapEmptyState, type MapEmptyStateProps } from "./shared/MapEmptyState";
export { MapAutoResizer, type MapAutoResizerProps } from "./shared/MapAutoResizer";
export { MapFlyTo, type MapFlyToProps } from "./shared/MapFlyTo";
export { MapFitBounds, type MapFitBoundsProps } from "./shared/MapFitBounds";
export {
  resolveCssColorToHex,
  buildAdaptiveSchemeRamp,
  useMapThemeTokens,
  type MapThemeTokens,
} from "./shared/tokenBridge";

export * from "./markers";
export * from "./route";
export * from "./geo";
export * from "./arc";
export * from "./heatmap";
export * from "./picker";

export {
  createLazyMap,
  LazyLocationMarkerMap,
  LazyRouteTrackingMap,
  LazyGeoDistributionMap,
  LazyArcFlightMap,
  LazyGeoHeatmapMap,
  LazyLocationPicker,
} from "./lazy";
