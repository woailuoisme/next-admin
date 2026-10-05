import type { ValueFormatter } from "../shared/formatters";

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
  height?: number;
  valueFormatter?: ValueFormatter;
  colorTheme?: "primary" | "chart-1" | "chart-2";
  legendTitle?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
}
