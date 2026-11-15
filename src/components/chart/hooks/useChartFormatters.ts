"use client";

import { useMemoizedFn } from "ahooks";

import { useFormatter } from "next-intl";

import {
  defaultAxisNumberFormatter,
  defaultComposedValueFormatter,
  defaultPercentageFormatter,
  defaultXAxisFormatter,
  toFiniteNumber,
} from "../shared/formatters";

export interface UseChartFormattersOptions {
  valueFormatter?: (val: number) => string;
  xAxisFormatter?: (val: string | number) => string;
  yAxisFormatter?: (val: number) => string;
  percentageFormatter?: (val: number) => string;
  /** When true, small decimals automatically format as percentages unless overridden. */
  composedMode?: boolean;
}

/**
 * Hook providing stable memoized formatters for chart axes, percentages, and tooltips.
 * Centralizes useFormatter + useMemoizedFn across all chart hooks and standalone overlays.
 */
export function useChartFormatters({
  valueFormatter: propValueFormatter,
  xAxisFormatter: propXAxisFormatter,
  yAxisFormatter: propYAxisFormatter,
  percentageFormatter: propPercentageFormatter,
  composedMode = false,
}: UseChartFormattersOptions = {}) {
  const format = useFormatter();

  const valueFormatter = useMemoizedFn((val: number) => {
    const safeVal = toFiniteNumber(val, 0);
    if (propValueFormatter) return propValueFormatter(safeVal);
    if (composedMode) return defaultComposedValueFormatter(safeVal, format);
    return format.number(safeVal);
  });

  const xAxisFormatter = useMemoizedFn((val: string | number) => {
    if (propXAxisFormatter) return propXAxisFormatter(val);
    return defaultXAxisFormatter(val);
  });

  const yAxisFormatter = useMemoizedFn((val: number) => {
    const safeVal = toFiniteNumber(val, 0);
    if (propYAxisFormatter) return propYAxisFormatter(safeVal);
    return defaultAxisNumberFormatter(safeVal);
  });

  const percentageFormatter = useMemoizedFn((val: number) => {
    const safeVal = toFiniteNumber(val, 0);
    if (propPercentageFormatter) return propPercentageFormatter(safeVal);
    return defaultPercentageFormatter(safeVal);
  });

  return {
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
    percentageFormatter,
  };
}
