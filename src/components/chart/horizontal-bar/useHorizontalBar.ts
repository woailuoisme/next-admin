"use client";

import { maxBy, orderBy, sumBy } from "es-toolkit";

import type { EnrichedHorizontalBarItem, HorizontalBarChartProps } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";
import { EMPTY_DATA } from "../shared/constants";
import { toFiniteNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

/**
 * 归一化横向条形图数据：排序、截断、按最大值换算条宽并着色
 */
export function useHorizontalBar(props: HorizontalBarChartProps) {
  const {
    data = EMPTY_DATA,
    maxItems = 6,
    valueFormatter: propValueFormatter,
    percentageFormatter: propPercentageFormatter,
    theme = "primary",
  } = props;

  const { activeStroke } = useChartTheme({
    theme,
  });

  const { valueFormatter, percentageFormatter } = useChartFormatters({
    valueFormatter: propValueFormatter,
    percentageFormatter: propPercentageFormatter,
  });

  const items: EnrichedHorizontalBarItem[] = (() => {
    if (!data.length) return [];
    const normalized = data.map((item) => ({
      ...item,
      value: Math.max(0, toFiniteNumber(item.value, 0)),
    }));
    const sorted = orderBy(normalized, [(item) => item.value], ["desc"]);
    const sliced = sorted.slice(0, maxItems);
    const max = maxBy(sliced, (item) => item.value)?.value ?? 1;
    const sum = sumBy(sliced, (item) => item.value);

    return sliced.map((item, idx) => {
      const pct =
        typeof item.percentage === "number" && Number.isFinite(item.percentage)
          ? item.percentage
          : sum > 0
            ? (item.value / sum) * 100
            : 0;
      const barPct = max > 0 ? (item.value / max) * 100 : 0;
      const color = item.color || CHART_PALETTE[idx % CHART_PALETTE.length] || activeStroke;

      return {
        ...item,
        pct,
        barPct,
        color,
      };
    });
  })();

  return {
    items,
    hasData: items.length > 0,
    valueFormatter,
    percentageFormatter,
  };
}
