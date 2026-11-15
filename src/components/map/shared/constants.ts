import type { RouteStop } from "../route/types";
import type { Coordinates } from "./types";

/** 默认地图中心（模块级常量，避免默认参数每次渲染新建数组并击穿下游 useMemo） */
export const DEFAULT_MAP_CENTER: Coordinates = [110, 30];

/** 中国地理中心默认视角 */
export const CHINA_MAP_CENTER: Coordinates = [104.1954, 35.8617];

/** 默认北京基准中心点 */
export const DEFAULT_BEIJING_CENTER: Coordinates = [116.4074, 39.9042];

/** 稳定的空站点序列，用作路线图 props 的兜底默认值 */
export const EMPTY_STOPS: RouteStop[] = [];

const GLYPH_FONT_FALLBACK = "Noto%20Sans%20Regular";
const UNSUPPORTED_CLUSTER_FONT_RE = /\/Open(?:%20|\+| )Sans(?:%20|\+| )Semibold(?=\/)/i;

/**
 * 拦截底层 `src/components/ui/map.tsx` 中 `MapClusterLayer` 硬编码的 `"Open Sans Semibold"` 字体 PBF 请求，
 * 重写为 Carto 与 OpenFreeMap 均原生支持的 `"Noto Sans Regular"`，避免 `0-255.pbf` 触发 HTTP 404。
 */
export function transformMapRequest(url: string, resourceType?: string): { url: string } {
  if ((resourceType === "Glyphs" || url.includes("/fonts/")) && UNSUPPORTED_CLUSTER_FONT_RE.test(url)) {
    return {
      url: url.replace(UNSUPPORTED_CLUSTER_FONT_RE, `/${GLYPH_FONT_FALLBACK}`),
    };
  }
  return { url };
}

/**
 * 保留紧缩型底图署名控件（满足 OSM / Carto / 天地图数据署名条款），
 * 同时挂载字体请求重写钩子，避免底层聚合图层字体堆栈 404。
 */
export const MAP_ATTRIBUTION_PROPS = {
  attributionControl: { compact: true },
  transformRequest: transformMapRequest,
} as const;

/** @deprecated 兼容保留，内部建议改用 MAP_ATTRIBUTION_PROPS */
export const MAP_NO_ATTRIBUTION = MAP_ATTRIBUTION_PROPS;

/**
 * 默认（非 DOM / 测试环境下）静态回退色值。
 * 运行时 WebGL 图层应优先使用 `useMapThemeTokens()`（tokenBridge.ts）解析当前主题变量。
 */
export const MAP_PRIMARY = "#bb4d00";
export const MAP_PRIMARY_SOFT = "#f8a87d";
export const MAP_REGION_BORDER = "#e5e5e5";
export const MAP_PRIMARY_RAMP: readonly string[] = ["#ffecde", "#ffd1b6", "#f8a87d", "#de793e", "#bb4d00"];
