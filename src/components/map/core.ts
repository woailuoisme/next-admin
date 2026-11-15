/**
 * 纯 TypeScript 地理计算、底图预设与类型子路径入口（零 maplibre-gl WebGL 运行时依赖）。
 */

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

export {
  type CoordinateSystem,
  isValidCoordinate,
  isInsideChina,
  getBasemapCRS,
  resolveCoordinateSystems,
  transformCoordinates,
  wgs84ToGcj02,
  gcj02ToWgs84,
  gcj02ToBd09,
  bd09ToGcj02,
  wgs84ToBd09,
  bd09ToWgs84,
} from "./utils/coordinates";

export {
  type GeoBounds,
  type ChoroplethLegendStep,
  type ChoroplethComputation,
  sanitizeCoordinatesList,
  computeBounds,
  resolveBoundingCenter,
  buildSplitArcSegments,
  extractGeoJSONPoints,
  transformGeoJSON,
  buildChoroplethSteps,
} from "./utils/geoEngine";

export { type Coordinates, type MapCommonProps, type MapCardSlotProps, type MapFeedbackProps } from "./shared/types";
