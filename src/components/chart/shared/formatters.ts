/**
 * High-performance pure numeric & axis formatters for chart visualizations
 * Following Vercel React Best Practices (pure functions, hoisted outside component scope)
 */

export type ValueFormatter = (val: number) => string;

/**
 * Normalize unknown numeric input to a finite number with safe fallback.
 */
export function toFiniteNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : fallback;
  }
  if (val === null || val === undefined || val === "") {
    return fallback;
  }
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Resolve a ChartHeight (`number | string`) to a numeric pixel value for SVG/Recharts geometry math.
 */
export function resolveNumericChartHeight(height: number | string | undefined, fallback: number): number {
  if (typeof height === "number") {
    return Number.isFinite(height) ? height : fallback;
  }
  if (typeof height === "string") {
    const trimmed = height.trim();
    if (/^\d+(\.\d+)?(px)?$/i.test(trimmed)) {
      const parsed = Number.parseFloat(trimmed);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
  }
  return fallback;
}

/**
 * Default number formatter with locale grouping
 */
export function defaultNumberFormatter(val: number): string {
  if (typeof val !== "number" || !Number.isFinite(val)) {
    return "0";
  }
  return val.toLocaleString();
}

/**
 * Compact axis number formatter (e.g. 1.2M, 50k, 100)
 */
export function defaultAxisNumberFormatter(val: number): string {
  if (typeof val !== "number" || !Number.isFinite(val)) {
    return "";
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
  if (typeof val !== "number" || !Number.isFinite(val)) {
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
export function defaultComposedValueFormatter(val: number, format?: { number: (value: number) => string }): string {
  if (typeof val !== "number" || !Number.isFinite(val)) {
    return "0";
  }
  if (Math.abs(val) <= 100 && String(val).includes(".")) {
    return `${val.toFixed(1)}%`;
  }
  return format ? format.number(val) : defaultNumberFormatter(val);
}
