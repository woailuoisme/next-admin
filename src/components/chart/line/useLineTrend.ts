import { useMemo } from "react";

import type { LineTrendChartProps } from "./types";

import { useChartContainer } from "../hooks/useChartContainer";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";
import { CHART_PALETTE } from "../shared/theme";

export function useLineTrend(props: LineTrendChartProps) {
  const {
    series,
    dataKey = "value",
    seriesName = "数值",
    theme = "primary",
    color,
    height = 300,
    referenceValue,
    referenceLabel,
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  } = props;

  const { themeConfig, activeStroke } = useChartTheme({
    theme,
    color,
  });

  const {
    containerRef,
    width,
    height: chartHeight,
  } = useChartContainer({
    height,
  });

  const { valueFormatter, xAxisFormatter, yAxisFormatter } = useChartFormatters({
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  });

  const normalizedSeries = useMemo(() => {
    if (series?.length) {
      return series.map((s, idx) => ({
        ...s,
        color: s.color || CHART_PALETTE[idx % CHART_PALETTE.length],
        strokeWidth: s.strokeWidth ?? 2.5,
      }));
    }

    return [
      {
        dataKey,
        name: seriesName,
        color: activeStroke,
        strokeWidth: 2.5,
      },
    ];
  }, [series, dataKey, seriesName, activeStroke]);

  const formattedReferenceLabel =
    typeof referenceValue === "number"
      ? (referenceLabel ?? `目标: ${valueFormatter(referenceValue)}`)
      : undefined;

  return {
    containerRef,
    width,
    chartHeight,
    themeConfig,
    activeStroke,
    normalizedSeries,
    formattedReferenceLabel,
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
