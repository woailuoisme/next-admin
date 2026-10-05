import type {
  ComposedBarConfig,
  ComposedLineConfig,
  DonutSliceData,
  LineSeriesConfig,
  RadarSeriesConfig,
} from "@/components/chart";

// Re-export chart types in types-only mode to prevent bundling Recharts into stats core
export type * from "@/components/chart";

/**
 * Backward compatibility type aliases
 */
export type AreaChartDataPoint = Record<string, unknown>;
export type BarChartDataPoint = Record<string, unknown>;
export type DonutSegment = DonutSliceData;
export type LineChartSeries = LineSeriesConfig;
export type ComposedBarSeries = ComposedBarConfig;
export type ComposedLineSeries = ComposedLineConfig;
export type RadarDataPoint = Record<string, unknown>;
export type RadarSeries = RadarSeriesConfig;

// Sub-domain domain types
export * from "./shared/types";
export * from "./primitives/types";
export * from "./sparkline/types";
export * from "./stat-card/types";
export * from "./live-card/types";
export * from "./progress-card/types";
export * from "./multi-metric-card/types";
export * from "./grid/types";
