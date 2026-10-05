import type { ValueFormatter } from "../shared/formatters";
import type { ChartReferenceLine } from "../shared/types";

export interface ScatterPoint {
  x?: number;
  y?: number;
  z?: number; // bubble size
  name?: string;
  category?: string;
  fill?: string;
  [key: string]: unknown;
}

export interface ScatterSeries {
  name: string;
  data: ScatterPoint[];
  fill?: string;
}

export interface ScatterMetricChartProps {
  data?: ScatterPoint[];
  series?: ScatterSeries[];
  xAxisKey?: string;
  yAxisKey?: string;
  zAxisKey?: string;
  nameKey?: string;
  categoryKey?: string;
  xAxisName?: string;
  yAxisName?: string;
  zAxisName?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  zAxisLabel?: string;
  xReferenceLine?: number;
  yReferenceLine?: number;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  xFormatter?: ValueFormatter;
  yFormatter?: ValueFormatter;
  zFormatter?: ValueFormatter;
  xValueFormatter?: ValueFormatter;
  yValueFormatter?: ValueFormatter;
  zValueFormatter?: ValueFormatter;
  zRange?: [number, number]; // [minArea, maxArea] for bubble sizing
  referenceLines?: ChartReferenceLine[];
  className?: string;
}
