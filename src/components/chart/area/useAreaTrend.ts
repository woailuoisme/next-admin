import type { AreaTrendChartProps } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";

export function useAreaTrend(props: AreaTrendChartProps) {
  const {
    theme = "primary",
    color,
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  } = props;

  const { activeStroke, gradientId } = useChartTheme({
    theme,
    color,
    gradientPrefix: "area-grad-p",
  });

  const { valueFormatter, xAxisFormatter, yAxisFormatter } = useChartFormatters({
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  });

  return {
    activeStroke,
    gradientId,
    secondaryGradId: `area-grad-s-${gradientId}`,
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
