import { useId } from "react";

import type { ChartTheme } from "../shared/theme";

import { getChartTheme } from "../shared/theme";

export interface UseChartThemeOptions {
  theme?: ChartTheme;
  color?: string;
  gradientPrefix?: string;
}

/**
 * Hook to derive a stable chart stroke color and a unique gradient ID
 */
export function useChartTheme({
  theme = "primary",
  color,
  gradientPrefix = "chart-grad",
}: UseChartThemeOptions = {}) {
  const rawId = useId();
  const gradientId = `${gradientPrefix}-${rawId.replace(/:/g, "")}`;

  return {
    activeStroke: color || getChartTheme(theme).strokeColor,
    gradientId,
  };
}
