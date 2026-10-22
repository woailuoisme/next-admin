import type { StatCardTheme } from "../shared/types";

/**
 * Sparkline micro-chart data point object
 */
export interface SparklinePoint {
  value: number;
  [key: string]: unknown;
}

/**
 * Visual presentation style for sparkline
 */
export type SparklineType = "area" | "bar";

/**
 * Sparkline component props
 */
export interface SparklineProps {
  /** Array of raw numeric values or objects with a numeric `value` property */
  data: readonly (number | SparklinePoint)[];
  /** Color accent theme (maps to shared theme tokens) */
  theme?: StatCardTheme;
  /** Main stroke / fill color (Hex, RGB, HSL, or CSS variable). Overrides theme strokeColor */
  color?: string;
  /** Optional unique SVG linearGradient id for the area fill */
  gradientId?: string;
  /** Micro-chart type: smooth area curve or discrete bars (default: "area") */
  type?: SparklineType;
  /** SVG viewBox width (default: 100) */
  width?: number;
  /** SVG viewBox height (default: 32) */
  height?: number;
  /** Stroke width for area path (default: 2) */
  strokeWidth?: number;
  /** Custom CSS classes on the SVG element */
  className?: string;
}

export type MiniSparklineProps = SparklineProps;
