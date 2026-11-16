"use client";

import { useMemo } from "react";

import type { WaterfallFinancialChartProps, WaterfallItem, WaterfallItemType, WaterfallProcessedItem } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { toFiniteNumber } from "../shared/formatters";

function resolveWaterfallType(
  item: WaterfallItem,
  index: number,
  totalLength: number,
  rawVal: number,
): WaterfallItemType {
  if (item.type) return item.type;
  if (item.isTotal) return "total";
  if (index === 0) return "start";

  const normalizedLabel = item.label.toLowerCase();
  if (
    index === totalLength - 1 &&
    (normalizedLabel.includes("total") ||
      normalizedLabel.includes("net") ||
      item.label.includes("总") ||
      item.label.includes("净利"))
  ) {
    return "total";
  }

  return rawVal >= 0 ? "increase" : "decrease";
}

export function useWaterfallFinancial(props: WaterfallFinancialChartProps) {
  const { data, valueFormatter: customFormatter } = props;

  const processedData = useMemo<WaterfallProcessedItem[]>(() => {
    if (!data || data.length === 0) return [];

    let runningTotal = 0;
    const items: WaterfallProcessedItem[] = [];

    for (const [index, item] of data.entries()) {
      const rawVal = toFiniteNumber(item.value);
      const itemType = resolveWaterfallType(item, index, data.length, rawVal);

      let start = 0;
      let end = rawVal;
      let nextRunningTotal = rawVal;

      if (itemType === "increase") {
        start = runningTotal;
        end = runningTotal + Math.abs(rawVal);
        nextRunningTotal = end;
      } else if (itemType === "decrease") {
        start = runningTotal;
        end = runningTotal - Math.abs(rawVal);
        nextRunningTotal = end;
      }

      const range: [number, number] = [Math.min(start, end), Math.max(start, end)];
      const defaultFill =
        itemType === "start" || itemType === "total"
          ? "var(--primary)"
          : itemType === "increase"
            ? "var(--chart-1)"
            : "var(--destructive)";

      items.push({
        label: item.label,
        rawVal,
        range,
        type: itemType,
        fill: item.fill || defaultFill,
        runningTotal: nextRunningTotal,
      });

      runningTotal = nextRunningTotal;
    }

    return items;
  }, [data]);

  const { valueFormatter } = useChartFormatters({ valueFormatter: customFormatter });

  return {
    processedData,
    valueFormatter,
  };
}
