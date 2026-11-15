import type { ChartTheme, ChartThemeConfig } from "@/components/chart/shared/theme";

/**
 * Visual density modes for StatCards and Grids
 */
export type StatDensity = "compact" | "default" | "comfortable";

/**
 * Layout position of the mini sparkline within a StatCard
 */
export type SparklineLayout = "inline" | "bottom";

/**
 * Semantic theme accents for StatCards
 */
export type StatCardTheme = ChartTheme;

/**
 * Visual color configuration for stat themes
 */
export type ThemeConfig = ChartThemeConfig;
