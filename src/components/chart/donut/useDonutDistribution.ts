import { sumBy } from "es-toolkit";
import { useMemo } from "react";

import type { DonutDistributionChartProps, EnrichedDonutSliceData } from "./types";

import { useChartContainer } from "../hooks/useChartContainer";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { EMPTY_DATA } from "../shared/constants";
import { CHART_PALETTE } from "../shared/theme";

/**
 * 聚合环图数据：计算总量、按调色板着色并派生出百分比
 */
export function useDonutDistribution(props: DonutDistributionChartProps) {
  const {
    data = EMPTY_DATA,
    centerLabel = "总计",
    centerValue,
    valueFormatter: propValueFormatter,
    height = 260,
  } = props;

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

  const { total, enrichedData } = useMemo(() => {
    const sum = sumBy(data, (curr) => curr.value);
    const enriched: EnrichedDonutSliceData[] = data.map((item, idx) => {
      const color = item.color || CHART_PALETTE[idx % CHART_PALETTE.length];
      const percentage = sum > 0 ? (item.value / sum) * 100 : 0;
      return {
        ...item,
        color,
        fill: color,
        percentage,
      };
    });
    return { total: sum, enrichedData: enriched };
  }, [data]);

  const displayCenterValue = centerValue ?? valueFormatter(total);

  return {
    containerRef,
    width,
    chartHeight,
    total,
    enrichedData,
    centerLabel,
    displayCenterValue,
    valueFormatter,
  };
}
