import type { ValueFormatter } from "../shared/formatters";

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
  height?: number;
  valueFormatter?: ValueFormatter;
  showTooltip?: boolean;
  showLabels?: boolean;
  showRates?: boolean;
  className?: string;
}
