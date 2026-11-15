import type { ValueFormatter } from "../shared/formatters";
import type { ChartHeight } from "../shared/types";

export type WaterfallItemType = "start" | "increase" | "decrease" | "total";

export interface WaterfallItem {
  label: string;
  value: number;
  type?: WaterfallItemType;
  isTotal?: boolean;
  fill?: string;
  [key: string]: unknown;
}

export interface WaterfallProcessedItem {
  label: string;
  rawVal: number;
  range: [number, number];
  type: WaterfallItemType;
  fill: string;
  runningTotal: number;
}

export interface WaterfallFinancialChartProps {
  data: WaterfallItem[];
  height?: ChartHeight;
  valueFormatter?: ValueFormatter;
  xAxisFormatter?: (val: string | number) => string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  isAnimationActive?: boolean;
  className?: string;
}
