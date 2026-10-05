export type ChartTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5";

export interface ChartThemeConfig {
  /** Tailwind classes for icon container badge */
  iconBadge: string;
  /** Tailwind classes for card top border or accent bar */
  accentBar: string;
  /** CSS var or Hex color for SVG / Recharts stroke */
  strokeColor: string;
  /** CSS var or Hex color for Recharts fill */
  fillColor: string;
  /** Tailwind classes for text highlighting */
  textClass: string;
  /** Gradient stop colors */
  gradient: {
    from: string;
    to: string;
  };
}

interface ThemeClasses {
  iconBadge: string;
  accentBar: string;
  textClass: string;
}

const THEME_CLASSES: Record<ChartTheme, ThemeClasses> = {
  primary: {
    iconBadge: "bg-primary/10 text-primary border-primary/20",
    accentBar: "bg-primary",
    textClass: "text-primary",
  },
  secondary: {
    iconBadge: "bg-secondary/10 text-secondary border-secondary/20",
    accentBar: "bg-secondary",
    textClass: "text-secondary",
  },
  accent: {
    iconBadge: "bg-accent/10 text-accent border-accent/20",
    accentBar: "bg-accent",
    textClass: "text-accent",
  },
  destructive: {
    iconBadge: "bg-destructive/10 text-destructive border-destructive/20",
    accentBar: "bg-destructive",
    textClass: "text-destructive",
  },
  "chart-1": {
    iconBadge: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    accentBar: "bg-chart-1",
    textClass: "text-chart-1",
  },
  "chart-2": {
    iconBadge: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    accentBar: "bg-chart-2",
    textClass: "text-chart-2",
  },
  "chart-3": {
    iconBadge: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    accentBar: "bg-chart-3",
    textClass: "text-chart-3",
  },
  "chart-4": {
    iconBadge: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    accentBar: "bg-chart-4",
    textClass: "text-chart-4",
  },
  "chart-5": {
    iconBadge: "bg-chart-5/10 text-chart-5 border-chart-5/20",
    accentBar: "bg-chart-5",
    textClass: "text-chart-5",
  },
};

const createThemeConfig = (theme: ChartTheme): ChartThemeConfig => ({
  iconBadge: THEME_CLASSES[theme].iconBadge,
  accentBar: THEME_CLASSES[theme].accentBar,
  strokeColor: `var(--${theme})`,
  fillColor: `var(--${theme})`,
  textClass: THEME_CLASSES[theme].textClass,
  gradient: {
    from: `var(--${theme})`,
    to: "transparent",
  },
});

export const CHART_THEMES: Record<ChartTheme, ChartThemeConfig> = {
  primary: createThemeConfig("primary"),
  secondary: createThemeConfig("secondary"),
  accent: createThemeConfig("accent"),
  destructive: createThemeConfig("destructive"),
  "chart-1": createThemeConfig("chart-1"),
  "chart-2": createThemeConfig("chart-2"),
  "chart-3": createThemeConfig("chart-3"),
  "chart-4": createThemeConfig("chart-4"),
  "chart-5": createThemeConfig("chart-5"),
};

/**
 * Curated color palette for Donut, Radar, and Multi-series charts
 */
export const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--destructive)",
  "var(--secondary)",
  "var(--accent)",
  "var(--muted)",
];

/**
 * Get theme configuration with safe fallback
 */
export function getChartTheme(theme: ChartTheme = "primary"): ChartThemeConfig {
  return CHART_THEMES[theme] || CHART_THEMES.primary;
}
