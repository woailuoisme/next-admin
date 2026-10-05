import type { ValueFormatter } from "../shared/formatters";

export type WaterfallItemType = "start" | "increase" | "decrease" | "total";

export interface WaterfallItem {
  label: string;
  value: number;
  type?: WaterfallItemType;
  fill?: string;
  [key: string]: unknown;
}

export interface WaterfallProcessedItem {
  label: string;
  rawVal: number;
  base: number;
  delta: number;
  type: WaterfallItemType;
  fill: string;
  runningTotal: number;
}

export interface WaterfallFinancialChartProps {
  data: WaterfallItem[];
  height?: number;
  valueFormatter?: ValueFormatter;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  className?: string;
}
