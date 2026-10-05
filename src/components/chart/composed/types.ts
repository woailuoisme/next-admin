import type { ChartBrushConfig, ChartReferenceLine } from "../shared/types";

export interface ComposedBarConfig {
  dataKey: string;
  name?: string;
  color?: string;
  yAxisId?: "left" | "right";
}

export interface ComposedLineConfig {
  dataKey: string;
  name?: string;
  color?: string;
  yAxisId?: "left" | "right";
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface ComposedTrendChartProps {
  data: Record<string, any>[];
  bars: ComposedBarConfig[];
  lines: ComposedLineConfig[];
  xAxisKey?: string;
  leftAxisFormatter?: (val: number) => string;
  rightAxisFormatter?: (val: number) => string;
  valueFormatter?: (val: number) => string;
  referenceLines?: ChartReferenceLine[];
  showBrush?: boolean | ChartBrushConfig;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}
