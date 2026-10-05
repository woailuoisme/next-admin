import type { StatCardTrendData, TrendDirection } from "./types";

import { parseNumericValue } from "../shared/utils";

export interface TrendInfoResult {
  dir: TrendDirection;
  isSuccess: boolean;
  isDanger: boolean;
  colorClass: string;
  displayValue: string | number;
  label?: string;
}

const SUCCESS_COLOR_CLASS = "text-chart-2 bg-chart-2/10 border-chart-2/20";
const DANGER_COLOR_CLASS = "text-destructive bg-destructive/10 border-destructive/20";
const NEUTRAL_COLOR_CLASS = "text-muted-foreground bg-muted border-border";

/**
 * Pure calculation function for trend semantic colors and direction
 */
export function calculateTrendInfo(trend?: StatCardTrendData | null): TrendInfoResult | null {
  if (!trend) return null;

  let dir: TrendDirection = trend.direction ?? "neutral";
  if (!trend.direction) {
    const numVal = parseNumericValue(trend.value);

    if (Number.isNaN(numVal) || numVal === 0) {
      dir = "neutral";
    } else {
      dir = numVal > 0 ? "up" : "down";
    }
  }

  const isGood = trend.isPositiveGood !== false;
  const isSuccess = (dir === "up" && isGood) || (dir === "down" && !isGood);
  const isDanger = (dir === "down" && isGood) || (dir === "up" && !isGood);

  const colorClass = isSuccess
    ? SUCCESS_COLOR_CLASS
    : isDanger
      ? DANGER_COLOR_CLASS
      : NEUTRAL_COLOR_CLASS;

  const displayValue = typeof trend.value === "number" ? `${trend.value}%` : trend.value;

  return {
    dir,
    isSuccess,
    isDanger,
    colorClass,
    displayValue,
    label: trend.label,
  };
}

/**
 * 读取趋势信息；无有效 value 时返回 null（记忆化交由 React Compiler 处理）
 */
export function useTrendInfo(trend?: StatCardTrendData | null): TrendInfoResult | null {
  const val = trend?.value;
  if (val === undefined || val === null) return null;

  return calculateTrendInfo({
    value: val,
    direction: trend?.direction,
    label: trend?.label,
    isPositiveGood: trend?.isPositiveGood,
  });
}
