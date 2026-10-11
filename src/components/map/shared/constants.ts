import type { RouteStop } from "../route/types";
import type { Coordinates } from "./types";

/** 默认地图中心（模块级常量，避免默认参数每次渲染新建数组并击穿下游 useMemo） */
export const DEFAULT_MAP_CENTER: Coordinates = [110, 30];

/** 中国地理中心默认视角 */
export const CHINA_MAP_CENTER: Coordinates = [104.1954, 35.8617];

/** 稳定的空站点序列，用作路线图 props 的兜底默认值 */
export const EMPTY_STOPS: RouteStop[] = [];

/**
 * 关闭 MapLibre 默认的 attribution 控件（右下角悬浮的 (i) 按钮）
 *
 * ⚠️ 版权提示：OSM / Carto 等瓦片服务的条款要求展示数据来源署名。
 * 关闭后请确保在页面其他位置保留了必要的版权信息，否则可能违反其服务条款。
 * 需要恢复时删掉各 `<Map>` 上的 `{...MAP_NO_ATTRIBUTION}` 即可。
 */
export const MAP_NO_ATTRIBUTION = { attributionControl: false } as const;

/**
 * 地图图层色板（**必须是具体色值**）
 *
 * MapLibre 的 paint 色只接受 hex / rgb / hsl / 具名色，无法解析 CSS 变量
 * `var(--x)`、`oklch()` 与 `color-mix()`（已用 maplibre style-spec 校验器实测：
 * 三者均报 `color expected`）。因此地图色必须就地写具体值 —— 这与
 * `ui/map.tsx` 中 `GEOJSON_DEFAULT_COLORS` 的既有约定一致。
 *
 * 取值与设计 token 对齐（oklch → sRGB 精确换算）：
 * - `--primary` 浅色 `oklch(0.555 0.163 48.998)` → `#bb4d00`
 * - `--border`  浅色 `oklch(0.922 0 0)`        → `#e5e5e5`
 */
export const MAP_PRIMARY = "#bb4d00";

/** 主色淡化档，用于次级折线（如未走完的路线、非高亮飞线） */
export const MAP_PRIMARY_SOFT = "#f8a87d";

/** 区域描边色 */
export const MAP_REGION_BORDER = "#e5e5e5";

/**
 * `--primary` 的 5 级顺序色阶（浅 → 深）
 * Choropleth 填充与图例色块共用同一份，避免两处色值漂移
 */
export const MAP_PRIMARY_RAMP: readonly string[] = ["#ffecde", "#ffd1b6", "#f8a87d", "#de793e", "#bb4d00"];
