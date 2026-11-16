import type { ChartHeight } from "../shared/types";

export interface RadarSeriesConfig {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
}

export interface RadarMetricChartProps {
  data: Record<string, unknown>[];
  series: RadarSeriesConfig[];
  subjectKey?: string;
  maxDomain?: number;
  height?: ChartHeight;
  valueFormatter?: (val: number) => string;
  showTooltip?: boolean;
  showRadiusAxis?: boolean;
  showRadiusTicks?: boolean;
  isAnimationActive?: boolean;
  className?: string;
  ariaLabel?: string;
}
