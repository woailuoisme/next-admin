import type { ValueFormatter } from "../shared/formatters";
import type { ChartHeight } from "../shared/types";

export interface TreemapItem {
  name: string;
  value?: number;
  size?: number;
  category?: string;
  children?: TreemapItem[];
  [key: string]: unknown;
}

export interface TreemapDistributionChartProps {
  data: TreemapItem[];
  height?: ChartHeight;
  valueFormatter?: ValueFormatter;
  colorPalette?: string[];
  aspectRatio?: number;
  showTooltip?: boolean;
  isAnimationActive?: boolean;
  className?: string;
}
