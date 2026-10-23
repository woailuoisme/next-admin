import { useMemo } from "react";

import { useFormatter } from "next-intl";

import type { WaterfallFinancialChartProps, WaterfallItem, WaterfallItemType, WaterfallProcessedItem } from "./types";

export function useWaterfallFinancial(props: WaterfallFinancialChartProps) {
  const { data, valueFormatter: customFormatter } = props;

  const processedData = useMemo<WaterfallProcessedItem[]>(() => {
    if (!data || data.length === 0) return [];

    let runningTotal = 0;

    return data.map((item: WaterfallItem, index: number) => {
      let itemType: WaterfallItemType = item.type || "increase";

      if (!item.type) {
        if (index === 0) {
          itemType = "start";
        } else if (
          index === data.length - 1 &&
          (item.label.toLowerCase().includes("total") ||
            item.label.toLowerCase().includes("net") ||
            item.label.includes("总") ||
            item.label.includes("净利"))
        ) {
          itemType = "total";
        } else {
          itemType = item.value >= 0 ? "increase" : "decrease";
        }
      }

      let base = 0;
      let delta = 0;
      const rawVal = item.value;

      if (itemType === "start" || itemType === "total") {
        base = 0;
        delta = rawVal;
        runningTotal = rawVal;
      } else if (itemType === "increase") {
        base = runningTotal;
        delta = Math.abs(rawVal);
        runningTotal += delta;
      } else {
        // decrease
        const amount = Math.abs(rawVal);
        runningTotal -= amount;
        base = runningTotal;
        delta = amount;
      }

      const defaultFill =
        itemType === "start" || itemType === "total"
          ? "var(--primary)"
          : itemType === "increase"
            ? "var(--chart-1)"
            : "var(--destructive)";

      return {
        label: item.label,
        rawVal,
        base,
        delta,
        type: itemType,
        fill: item.fill || defaultFill,
        runningTotal,
      };
    });
  }, [data]);

  const format = useFormatter();
  const valueFormatter = customFormatter ?? ((val: number) => format.number(val));

  return {
    processedData,
    valueFormatter,
  };
}
