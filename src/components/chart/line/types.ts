import type { ChartTheme } from "../shared/theme";
import type { ChartBrushConfig, ChartReferenceLine } from "../shared/types";

export interface LineSeriesConfig {
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export type LineCurveType = "monotone" | "linear" | "step" | "stepBefore" | "stepAfter" | "natural";

export interface LineTrendChartProps {
  data: Record<string, any>[];
  series?: LineSeriesConfig[];
  dataKey?: string;
  seriesName?: string;
  xAxisKey?: string;
  referenceValue?: number;
  referenceLabel?: string;
  referenceLines?: ChartReferenceLine[];
  showBrush?: boolean | ChartBrushConfig;
  curveType?: LineCurveType;
  showDots?: boolean;
  theme?: ChartTheme;
  color?: string;
  valueFormatter?: (val: number) => string;
  xAxisFormatter?: (val: string | number) => string;
  yAxisFormatter?: (val: number) => string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}
