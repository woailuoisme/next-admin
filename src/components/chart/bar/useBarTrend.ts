import type { BarTrendChartProps } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";

export function useBarTrend(props: BarTrendChartProps) {
  const {
    theme = "primary",
    color,
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

  return {
    activeStroke,
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
