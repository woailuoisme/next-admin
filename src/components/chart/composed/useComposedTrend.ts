import { useMemoizedFn } from "ahooks";
import { useFormatter } from "next-intl";
import { useMemo } from "react";

import type { ComposedTrendChartProps } from "./types";

import { EMPTY_DATA } from "../shared/constants";
import {
  defaultAxisNumberFormatter,
  defaultComposedValueFormatter,
  defaultPercentageFormatter,
} from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

/**
 * 归一化组合图配置：解析双轴、着色并补全默认描边宽度
 */
export function useComposedTrend(props: ComposedTrendChartProps) {
  const {
    bars = EMPTY_DATA,
    lines = EMPTY_DATA,
    leftAxisFormatter: propLeftAxisFormatter,
    rightAxisFormatter: propRightAxisFormatter,
    valueFormatter: propValueFormatter,
  } = props;

  const format = useFormatter();

  const hasRightAxis = bars.some((b) => b.yAxisId === "right") || lines.some((l) => l.yAxisId === "right");

  const leftAxisFormatter = useMemoizedFn((val: number) => {
    if (propLeftAxisFormatter) return propLeftAxisFormatter(val);
    return defaultAxisNumberFormatter(val);
  });

  const rightAxisFormatter = useMemoizedFn((val: number) => {
    if (propRightAxisFormatter) return propRightAxisFormatter(val);
    return defaultPercentageFormatter(val);
  });

  const valueFormatter = useMemoizedFn((val: number) => {
    if (propValueFormatter) return propValueFormatter(val);
    return defaultComposedValueFormatter(val, format);
  });

  const normalizedBars = useMemo(
    () =>
      bars.map((bar, idx) => ({
        ...bar,
        color: bar.color || CHART_PALETTE[idx % CHART_PALETTE.length],
        yAxisId: bar.yAxisId ?? "left",
      })),
    [bars],
  );

  const normalizedLines = useMemo(
    () =>
      lines.map((line, idx) => ({
        ...line,
        color: line.color || CHART_PALETTE[(bars.length + idx) % CHART_PALETTE.length],
        yAxisId: line.yAxisId ?? (hasRightAxis ? "right" : "left"),
        strokeWidth: line.strokeWidth ?? 2.5,
      })),
    [lines, bars.length, hasRightAxis],
  );

  return {
    hasRightAxis,
    normalizedBars,
    normalizedLines,
    leftAxisFormatter,
    rightAxisFormatter,
    valueFormatter,
  };
}
