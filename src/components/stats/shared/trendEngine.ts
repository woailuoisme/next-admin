import type { StatCardTrendData, TrendDirection } from "../stat-card/types";

import { parseNumericValue } from "./utils";

export type TrendTone = "positive" | "negative" | "neutral";
export type TrendSrKey = "trend_up" | "trend_down" | "trend_neutral";

export interface TrendInfoResult {
  dir: TrendDirection;
  tone: TrendTone;
  colorClass: string;
  inlineColorClass: string;
  displayValue: string | number;
  label?: string;
  srKey: TrendSrKey;
}

const TONE_BADGE_CLASSES: Record<TrendTone, string> = {
  positive: "text-chart-2 bg-chart-2/10 border-chart-2/20",
  negative: "text-destructive bg-destructive/10 border-destructive/20",
  neutral: "text-muted-foreground bg-muted border-border",
};

const TONE_INLINE_CLASSES: Record<TrendTone, string> = {
  positive: "text-chart-2",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

const DIR_SR_KEYS: Record<TrendDirection, TrendSrKey> = {
  up: "trend_up",
  down: "trend_down",
  neutral: "trend_neutral",
};

/**
 * Pure trend calculation engine resolving direction, semantic polarity,
 * and accessible formatting metadata without React Hook overhead.
 */
export function resolveTrendInfo(trend?: StatCardTrendData | null): TrendInfoResult | null {
  if (
    !trend ||
    trend.value === undefined ||
    trend.value === null ||
    (typeof trend.value === "string" && trend.value.trim() === "")
  ) {
    return null;
  }

  const parsedNum = parseNumericValue(trend.value);
  const numericValue = Number.isFinite(parsedNum) ? parsedNum : null;

  let dir: TrendDirection = trend.direction ?? "neutral";
  if (!trend.direction) {
    if (numericValue === null || numericValue === 0) {
      dir = "neutral";
    } else {
      dir = numericValue > 0 ? "up" : "down";
    }
  }

  let tone: TrendTone;
  if (trend.tone) {
    tone = trend.tone;
  } else {
    const isGood = trend.isPositiveGood !== false;
    if ((dir === "up" && isGood) || (dir === "down" && !isGood)) {
      tone = "positive";
    } else if ((dir === "down" && isGood) || (dir === "up" && !isGood)) {
      tone = "negative";
    } else {
      tone = "neutral";
    }
  }

  return {
    dir,
    tone,
    colorClass: TONE_BADGE_CLASSES[tone],
    inlineColorClass: TONE_INLINE_CLASSES[tone],
    displayValue: trend.value,
    label: trend.label,
    srKey: DIR_SR_KEYS[dir],
  };
}
