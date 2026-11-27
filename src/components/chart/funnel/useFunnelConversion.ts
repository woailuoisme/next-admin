"use client";

import type { FunnelConversionChartProps, FunnelItemWithRates } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { toFiniteNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

export function useFunnelConversion(props: FunnelConversionChartProps) {
  const { data, dataKey = "value", nameKey = "name", valueFormatter: customFormatter } = props;

  const initialValue = data && data.length > 0 ? toFiniteNumber(data[0]?.[dataKey] ?? data[0]?.value) : 0;
  const processedData: FunnelItemWithRates[] =
    !data || data.length === 0
      ? []
      : data.map((item, index) => {
          const value = toFiniteNumber(item[dataKey] ?? item.value);
          const name = String(item[nameKey] ?? item.name ?? "");
          const prevValue = index === 0 ? value : toFiniteNumber(data[index - 1]?.[dataKey] ?? data[index - 1]?.value);

          const conversionRate = initialValue > 0 ? Math.round((value / initialValue) * 1000) / 10 : 0;
          const stepRate = prevValue > 0 ? Math.round((value / prevValue) * 1000) / 10 : 0;
          const dropoffRate =
            index === 0 || prevValue <= 0 ? 0 : Math.max(0, Math.round(((prevValue - value) / prevValue) * 1000) / 10);

          const color = item.fill || CHART_PALETTE[index % CHART_PALETTE.length] || "var(--chart-1)";

          return {
            ...item,
            [dataKey]: value,
            [nameKey]: name,
            name,
            value,
            fill: color,
            conversionRate,
            dropoffRate,
            stepRate,
          };
        });

  const { valueFormatter } = useChartFormatters({ valueFormatter: customFormatter });

  return {
    processedData,
    valueFormatter,
  };
}
