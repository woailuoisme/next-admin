import type { ChartTheme } from "../shared/theme";
import type { ChartBrushConfig, ChartHeight, ChartReferenceLine } from "../shared/types";

export interface BarTrendChartProps {
  data: Record<string, unknown>[];
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
  height?: ChartHeight;
  showGrid?: boolean;
  showTooltip?: boolean;
  isAnimationActive?: boolean;
  className?: string;
  ariaLabel?: string;
}
