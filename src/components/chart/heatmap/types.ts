import type { ValueFormatter } from "../shared/formatters";
import type { ChartTheme } from "../shared/theme";
import type { ChartHeight } from "../shared/types";

export interface HeatmapCell {
  x?: string | number;
  y?: string;
  value?: number;
  [key: string]: unknown;
}

export interface HeatmapMatrixChartProps {
  data: HeatmapCell[];
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  xLabels?: (string | number)[];
  yLabels?: string[];
  xLabel?: string;
  yLabel?: string;
  height?: ChartHeight;
  valueFormatter?: ValueFormatter;
  colorTheme?: ChartTheme;
  legendTitle?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
}
