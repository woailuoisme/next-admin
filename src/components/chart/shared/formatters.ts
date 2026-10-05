/**
 * High-performance pure numeric & axis formatters for chart visualizations
 * Following Vercel React Best Practices (pure functions, hoisted outside component scope)
 */

export type ValueFormatter = (val: number) => string;

/**
 * Default number formatter with locale grouping
 */
export function defaultNumberFormatter(val: number): string {
  if (typeof val !== "number" || Number.isNaN(val)) {
    return String(val ?? 0);
  }
  return val.toLocaleString();
}

/**
 * Common alias for defaultNumberFormatter
 */
export const formatNumber = defaultNumberFormatter;

/**
 * Compact axis number formatter (e.g. 1.2M, 50k, 100)
 */
export function defaultAxisNumberFormatter(val: number): string {
  if (typeof val !== "number" || Number.isNaN(val)) {
    return String(val ?? "");
  }
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return String(val);
}

/**
 * Percentage formatter with optional precision
 */
export function defaultPercentageFormatter(val: number, decimals = 1): string {
  if (typeof val !== "number" || Number.isNaN(val)) {
    return "0%";
  }
  return Number.isInteger(val) ? `${val}%` : `${val.toFixed(decimals)}%`;
}

/**
 * Standard X-axis string converter
 */
export function defaultXAxisFormatter(val: string | number): string {
  return String(val ?? "");
}

/**
 * Adaptive formatter for composed charts (detects small decimals as percentages)
 */
export function defaultComposedValueFormatter(val: number): string {
  if (typeof val !== "number" || Number.isNaN(val)) {
    return String(val ?? 0);
  }
  return Math.abs(val) <= 100 && String(val).includes(".")
    ? `${val.toFixed(1)}%`
    : val.toLocaleString();
}
