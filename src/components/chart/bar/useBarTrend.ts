import type { BarTrendChartProps } from "./types";

import { useChartContainer } from "../hooks/useChartContainer";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";

export function useBarTrend(props: BarTrendChartProps) {
  const {
    theme = "primary",
    color,
    height = 300,
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
    secondaryDataKey,
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

  return {
    containerRef,
    width,
    chartHeight,
    themeConfig,
    activeStroke,
    hasSecondary: Boolean(secondaryDataKey),
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
