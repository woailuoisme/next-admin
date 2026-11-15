import { useMemo } from "react";

import type { ComposedTrendChartProps } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { DEFAULT_LINE_ACTIVE_DOT_BASE, EMPTY_DATA } from "../shared/constants";
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

  const hasRightAxis = bars.some((b) => b.yAxisId === "right") || lines.some((l) => l.yAxisId === "right");

  const { yAxisFormatter, percentageFormatter, valueFormatter } = useChartFormatters({
    yAxisFormatter: propLeftAxisFormatter,
    percentageFormatter: propRightAxisFormatter,
    valueFormatter: propValueFormatter,
    composedMode: true,
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
      lines.map((line, idx) => {
        const color = line.color || CHART_PALETTE[(bars.length + idx) % CHART_PALETTE.length];
        return {
          ...line,
          color,
          yAxisId: line.yAxisId ?? (hasRightAxis ? "right" : "left"),
          strokeWidth: line.strokeWidth ?? 2.5,
          activeDot: {
            ...DEFAULT_LINE_ACTIVE_DOT_BASE,
            stroke: color,
          },
        };
      }),
    [lines, bars.length, hasRightAxis],
  );

  return {
    hasRightAxis,
    normalizedBars,
    normalizedLines,
    leftAxisFormatter: yAxisFormatter,
    rightAxisFormatter: percentageFormatter,
    valueFormatter,
  };
}
