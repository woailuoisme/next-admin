/**
 * Static constants for chart components
 * Following Vercel React Best Practices (hoist-static-objects, rerender-memo-with-default-value)
 */

/** 通用空数组引用，用作图表数据类 props 的兜底默认值（避免每次渲染新建数组） */
export const EMPTY_DATA: never[] = [];

export const DEFAULT_ANIMATION_DURATION = 600;

/** 响应式容器的首帧占位宽度，避免 SSR/首屏测量前的 0 宽闪烁 */
export const DEFAULT_INITIAL_CHART_WIDTH = 500;

/** 坐标轴刻度统一样式（模块级常量，避免每次渲染新建对象触发整图重绘） */
export const AXIS_TICK_STYLE = {
  fontSize: 12,
  fill: "var(--muted-foreground)",
} as const;

/**
 * 网格线与坐标轴描边
 *
 * 注意：本项目设计 token 为 `oklch(...)`，`hsl(var(--x) / a)` 展开后是非法 CSS 会被整条丢弃，
 * 必须用 `color-mix()`（Tailwind v4 的 `/opacity` 工具类同样编译为 color-mix，浏览器基线一致）
 */
export const CHART_GRID_STROKE = "color-mix(in oklab, var(--border) 50%, transparent)";

export const CHART_AXIS_STROKE = "color-mix(in oklab, var(--border) 40%, transparent)";

/** 紧凑型轴刻度样式（极坐标角度轴 / 小尺寸图表） */
export const AXIS_TICK_STYLE_COMPACT = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
} as const;

/** 极坐标半径轴刻度样式 */
export const RADAR_RADIUS_TICK_STYLE = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
} as const;

/** 深色图表填充上的文字前景色（消费 primary-foreground 语义 token） */
export const CHART_ON_FILL_TEXT = "var(--primary-foreground)";

/** 参考线默认虚线样式与描边色 */
export const DEFAULT_REFERENCE_STROKE = "var(--destructive)";
export const DEFAULT_REFERENCE_DASH = "4 4";
export const DEFAULT_REFERENCE_STROKE_WIDTH = 1.5;

/** 底部缩放刷选框（Brush）默认样式 */
export const DEFAULT_BRUSH_HEIGHT = 28;
export const DEFAULT_BRUSH_STROKE = "var(--primary)";
export const DEFAULT_BRUSH_FILL = "color-mix(in oklab, var(--muted) 30%, transparent)";

export const DEFAULT_CHART_MARGIN = {
  top: 10,
  right: 12,
  left: -12,
  bottom: 0,
} as const;

export const DEFAULT_RADAR_CHART_MARGIN = {
  top: 15,
  right: 20,
  bottom: 15,
  left: 20,
} as const;

export const DEFAULT_COMPOSED_MARGIN = {
  top: 10,
  right: 10,
  left: -15,
  bottom: 0,
} as const;

export const DEFAULT_COMPOSED_MARGIN_WITH_RIGHT = {
  top: 10,
  right: 15,
  left: -15,
  bottom: 0,
} as const;

export const DEFAULT_LINE_DOT = {
  r: 3.5,
  strokeWidth: 1.5,
  fill: "var(--background)",
} as const;

export const DEFAULT_LINE_ACTIVE_DOT_BASE = {
  r: 5,
  strokeWidth: 2,
  fill: "var(--background)",
} as const;
