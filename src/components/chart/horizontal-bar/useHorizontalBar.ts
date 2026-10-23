import { useMemoizedFn } from "ahooks";
import { maxBy, orderBy, sumBy } from "es-toolkit";
import { useMemo } from "react";

import type { EnrichedHorizontalBarItem, HorizontalBarChartProps } from "./types";

import { useChartTheme } from "../hooks/useChartTheme";
import { EMPTY_DATA } from "../shared/constants";
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

  const valueFormatter = useMemoizedFn((val: number) => {
    if (propValueFormatter) return propValueFormatter(val);
    return val.toLocaleString();
  });

  const percentageFormatter = useMemoizedFn((val: number) => {
    if (propPercentageFormatter) return propPercentageFormatter(val);
    return Number.isInteger(val) ? `${val}%` : `${Math.round(val)}%`;
  });

  const items = useMemo<EnrichedHorizontalBarItem[]>(() => {
    if (!data.length) return [];
    const sorted = orderBy(data, [(item) => item.value], ["desc"]);
    const sliced = sorted.slice(0, maxItems);
    const max = maxBy(sliced, (item) => item.value)?.value ?? 1;
    const sum = sumBy(sliced, (item) => item.value);

    return sliced.map((item, idx) => {
      const pct = typeof item.percentage === "number" ? item.percentage : sum > 0 ? (item.value / sum) * 100 : 0;
      const barPct = max > 0 ? (item.value / max) * 100 : 0;
      const color = item.color || CHART_PALETTE[idx % CHART_PALETTE.length] || activeStroke;

      return {
        ...item,
        pct,
        barPct,
        color,
      };
    });
  }, [data, maxItems, activeStroke]);

  return {
    items,
    hasData: items.length > 0,
    valueFormatter,
    percentageFormatter,
  };
}
