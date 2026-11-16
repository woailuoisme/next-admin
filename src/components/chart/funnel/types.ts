import type { ValueFormatter } from "../shared/formatters";
import type { ChartHeight } from "../shared/types";

export interface FunnelItem {
  name: string;
  value: number;
  fill?: string;
  [key: string]: unknown;
}

export interface FunnelItemWithRates extends FunnelItem {
  conversionRate: number; // Percentage from initial (top) stage
  dropoffRate: number; // Percentage lost compared to previous stage
  stepRate: number; // Percentage of previous stage retained
}

export interface FunnelConversionChartProps {
  data: FunnelItem[];
  dataKey?: string;
  nameKey?: string;
  height?: ChartHeight;
  valueFormatter?: ValueFormatter;
  showTooltip?: boolean;
  showLabels?: boolean;
  showRates?: boolean;
  isAnimationActive?: boolean;
  className?: string;
  ariaLabel?: string;
}
