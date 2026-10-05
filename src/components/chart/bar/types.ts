import type { ChartTheme } from "../shared/theme";
import type { ChartBrushConfig, ChartReferenceLine } from "../shared/types";

export interface BarTrendChartProps {
  data: Record<string, any>[];
  dataKey?: string;
  xAxisKey?: string;
  secondaryDataKey?: string;
  theme?: ChartTheme;
  color?: string;
  valueFormatter?: (val: number) => string;
  xAxisFormatter?: (val: string | number) => string;
  yAxisFormatter?: (val: number) => string;
  referenceLines?: ChartReferenceLine[];
  showBrush?: boolean | ChartBrushConfig;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}
