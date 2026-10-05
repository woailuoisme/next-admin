import { useId } from "react";

import type { ChartTheme } from "../shared/theme";

import { getChartTheme } from "../shared/theme";

export interface UseChartThemeOptions {
  theme?: ChartTheme;
  color?: string;
  gradientPrefix?: string;
}

/**
 * Hook to derive stable chart theme colors and unique gradient IDs
 */
export function useChartTheme({
  theme = "primary",
  color,
  gradientPrefix = "chart-grad",
}: UseChartThemeOptions = {}) {
  const rawId = useId();
  const gradientId = `${gradientPrefix}-${rawId.replace(/:/g, "")}`;
  const themeConfig = getChartTheme(theme);

  const activeStroke = color || themeConfig.strokeColor;
  const activeFill = color || themeConfig.fillColor;

  return {
    themeConfig,
    activeStroke,
    activeFill,
    gradientId,
  };
}
