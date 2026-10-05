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
export type StatCardTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5";

/**
 * Visual color configuration for stat themes
 */
export interface ThemeConfig {
  /** Tailwind classes for icon container badge */
  iconBadge: string;
  /** Tailwind classes for card top border or accent bar (optional) */
  accentBar: string;
  /** Hex color or CSS var for SVG / Recharts lines & strokes */
  strokeColor: string;
  /** Hex color or RGBA or CSS var for Recharts gradient fills */
  fillColor: string;
  /** Tailwind classes for values or text highlighting */
  textClass: string;
}
