"use client";

import { useId } from "react";

import type { ChartTheme } from "../shared/theme";

import { getChartTheme, getSecondaryChartStroke } from "../shared/theme";

export interface UseChartThemeOptions {
  theme?: ChartTheme;
  color?: string;
  gradientPrefix?: string;
}

/**
 * Hook to derive a stable chart stroke color, contrasting secondary stroke, and a unique gradient ID
 */
export function useChartTheme({ theme = "primary", color, gradientPrefix = "chart-grad" }: UseChartThemeOptions = {}) {
  const rawId = useId();
  const gradientId = `${gradientPrefix}-${rawId.replace(/:/g, "")}`;

  return {
    activeStroke: color || getChartTheme(theme).strokeColor,
    secondaryStroke: getSecondaryChartStroke(theme),
    gradientId,
  };
}
