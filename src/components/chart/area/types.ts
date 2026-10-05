import type { ChartTheme } from "../shared/theme";
import type { ChartBrushConfig, ChartReferenceLine } from "../shared/types";

export interface AreaTrendChartProps {
  /** Data points array */
  data: Record<string, unknown>[];
  /** Main metric key, default is "value" */
  dataKey?: string;
  /** Label / Category key on X Axis, default is "label" */
  xAxisKey?: string;
  /** Optional comparison or target dataKey */
  secondaryDataKey?: string;
  /** Theme color preset */
  theme?: ChartTheme;
  /** Custom primary stroke color override */
  color?: string;
  /** Formatter function for metric numbers */
  valueFormatter?: (value: number) => string;
  /** Formatter for X axis labels */
  xAxisFormatter?: (value: string | number) => string;
  /** Formatter for Y axis ticks */
  yAxisFormatter?: (value: number) => string;
  /** Height in pixels or string */
  height?: number;
  /** Whether to display background grid lines */
  showGrid?: boolean;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Custom benchmark reference lines */
  referenceLines?: ChartReferenceLine[];
  /** Interactive timeline range slider / brush */
  showBrush?: boolean | ChartBrushConfig;
  /** Custom className */
  className?: string;
}
