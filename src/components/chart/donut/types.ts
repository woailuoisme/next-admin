import type { ChartHeight } from "../shared/types";

export interface DonutSliceData {
  name: string;
  value: number;
  color?: string;
}

export interface EnrichedDonutSliceData extends DonutSliceData {
  fill: string;
  percentage: number;
}

export interface DonutDistributionChartProps {
  data: DonutSliceData[];
  centerLabel?: string;
  centerValue?: string;
  valueFormatter?: (val: number) => string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  height?: ChartHeight;
  showLegend?: boolean;
  isAnimationActive?: boolean;
  className?: string;
}
