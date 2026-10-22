import { useMemo } from "react";

import type { LineTrendChartProps } from "./types";

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
    referenceValue,
    referenceLabel,
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  } = props;

  const { activeStroke } = useChartTheme({
    theme,
    color,
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
    normalizedSeries,
    formattedReferenceLabel,
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
