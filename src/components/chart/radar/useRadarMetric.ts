import { useMemo } from "react";

import type { RadarMetricChartProps } from "./types";

import { useChartContainer } from "../hooks/useChartContainer";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { EMPTY_DATA } from "../shared/constants";
import { CHART_PALETTE } from "../shared/theme";

/**
 * 归一化雷达图系列：按调色板着色并补全默认填充透明度
 */
export function useRadarMetric(props: RadarMetricChartProps) {
  const { series = EMPTY_DATA, height = 300, valueFormatter: propValueFormatter } = props;

  const {
    containerRef,
    width,
    height: chartHeight,
  } = useChartContainer({
    height,
  });

  const { valueFormatter } = useChartFormatters({
    valueFormatter: propValueFormatter,
  });

  const normalizedSeries = useMemo(() => {
    return series.map((s, idx) => ({
      ...s,
      color: s.color || CHART_PALETTE[idx % CHART_PALETTE.length],
      fillOpacity: s.fillOpacity ?? 0.25,
    }));
  }, [series]);

  return {
    containerRef,
    width,
    chartHeight,
    normalizedSeries,
    valueFormatter,
  };
}
