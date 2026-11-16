"use client";

import { sumBy } from "es-toolkit";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { DonutDistributionChartProps, EnrichedDonutSliceData } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { EMPTY_DATA } from "../shared/constants";
import { toFiniteNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

/**
 * 聚合环图数据：计算总量、按调色板着色并派生出百分比
 */
export function useDonutDistribution(props: DonutDistributionChartProps) {
  const t = useTranslations("chart");
  const { data = EMPTY_DATA, centerLabel = t("donut_total"), centerValue, valueFormatter: propValueFormatter } = props;

  const { valueFormatter } = useChartFormatters({
    valueFormatter: propValueFormatter,
  });

  const { total, enrichedData } = useMemo(() => {
    const normalized = data.map((item) => ({
      ...item,
      value: Math.max(0, toFiniteNumber(item.value, 0)),
    }));
    const sum = sumBy(normalized, (curr) => curr.value);
    const enriched: EnrichedDonutSliceData[] = normalized.map((item, idx) => {
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
    enrichedData,
    centerLabel,
    displayCenterValue,
    valueFormatter,
  };
}
