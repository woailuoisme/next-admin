import type { ComponentType } from "react";

import type { ChartTheme } from "../shared/theme";

export interface HorizontalBarItem {
  id?: string;
  label: string;
  value: number;
  percentage?: number;
  color?: string;
  secondaryLabel?: string;
  icon?: ComponentType<{ className?: string }>;
  [key: string]: any;
}

export interface EnrichedHorizontalBarItem extends HorizontalBarItem {
  pct: number;
  barPct: number;
  color: string;
}

export interface HorizontalBarChartProps {
  data: HorizontalBarItem[];
  maxItems?: number;
  valueFormatter?: (val: number) => string;
  percentageFormatter?: (val: number) => string;
  showPercentage?: boolean;
  theme?: ChartTheme;
  height?: number;
  className?: string;
}
