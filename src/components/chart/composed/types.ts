import type { ChartBrushConfig, ChartHeight, ChartReferenceLine } from "../shared/types";

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
  data: Record<string, unknown>[];
  bars: ComposedBarConfig[];
  lines: ComposedLineConfig[];
  xAxisKey?: string;
  xAxisFormatter?: (val: string | number) => string;
  leftAxisFormatter?: (val: number) => string;
  rightAxisFormatter?: (val: number) => string;
  valueFormatter?: (val: number) => string;
  referenceLines?: ChartReferenceLine[];
  showBrush?: boolean | ChartBrushConfig;
  height?: ChartHeight;
  showGrid?: boolean;
  showTooltip?: boolean;
  isAnimationActive?: boolean;
  className?: string;
}
