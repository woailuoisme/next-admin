import { CHART_THEMES } from "@/components/chart/shared/theme";

import type { StatCardTheme, ThemeConfig } from "./types";

export const STAT_THEMES: Record<StatCardTheme, ThemeConfig> = CHART_THEMES;

/**
 * Safely retrieve theme config with fallback to primary
 */
export function getStatTheme(theme: StatCardTheme = "primary"): ThemeConfig {
  return STAT_THEMES[theme] || STAT_THEMES.primary;
}

export { CHART_PALETTE } from "@/components/chart";
export type { StatCardTheme, ThemeConfig };
