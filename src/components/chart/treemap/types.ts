import type { ValueFormatter } from "../shared/formatters";

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
  height?: number;
  valueFormatter?: ValueFormatter;
  colorPalette?: string[];
  aspectRatio?: number;
  showTooltip?: boolean;
  nodeGap?: number;
  className?: string;
}
