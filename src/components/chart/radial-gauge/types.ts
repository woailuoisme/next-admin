import type { ChartTheme } from "../shared/theme";

export interface RadialGaugeThreshold {
  value: number;
  color: string;
}

export interface RadialGaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  formattedValue?: string;
  subtext?: string;
  theme?: ChartTheme;
  color?: string;
  height?: number;
  thresholds?: RadialGaugeThreshold[];
  className?: string;
}
