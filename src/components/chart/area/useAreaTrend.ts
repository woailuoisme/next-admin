import type { AreaTrendChartProps } from "./types";

import { useChartContainer } from "../hooks/useChartContainer";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";

export function useAreaTrend(props: AreaTrendChartProps) {
  const {
    theme = "primary",
    color,
    height = 300,
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
    secondaryDataKey,
  } = props;

  const { themeConfig, activeStroke, gradientId } = useChartTheme({
    theme,
    color,
    gradientPrefix: "area-grad-p",
  });

  const secondaryGradId = `area-grad-s-${gradientId}`;

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
    gradientId,
    secondaryGradId,
    hasSecondary: Boolean(secondaryDataKey),
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
