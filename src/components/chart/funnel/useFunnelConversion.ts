import { useMemo } from "react";

import type { FunnelConversionChartProps, FunnelItemWithRates } from "./types";

import { useChartContainer } from "../hooks/useChartContainer";
import { formatNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

export function useFunnelConversion(props: FunnelConversionChartProps) {
  const { data, valueFormatter: customFormatter } = props;
  const { containerRef } = useChartContainer();

  const processedData = useMemo<FunnelItemWithRates[]>(() => {
    if (!data || data.length === 0) return [];

    const initialValue = data[0]?.value || 1;

    return data.map((item, index) => {
      const prevValue = index === 0 ? item.value : data[index - 1]?.value || 1;
      const conversionRate = Math.round((item.value / initialValue) * 1000) / 10;
      const stepRate = Math.round((item.value / prevValue) * 1000) / 10;
      const dropoffRate =
        index === 0
          ? 0
          : Math.max(0, Math.round(((prevValue - item.value) / prevValue) * 1000) / 10);

      const color = item.fill || CHART_PALETTE[index % CHART_PALETTE.length] || "var(--chart-1)";

      return {
        ...item,
        fill: color,
        conversionRate,
        dropoffRate,
        stepRate,
      };
    });
  }, [data]);

  const valueFormatter = customFormatter ?? formatNumber;

  return {
    containerRef,
    processedData,
    valueFormatter,
  };
}
