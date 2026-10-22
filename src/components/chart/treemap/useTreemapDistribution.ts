import { useMemo } from "react";

import type { TreemapItem } from "./types";

interface UseTreemapDistributionOptions {
  data: TreemapItem[];
  colorPalette?: string[];
}

const DEFAULT_TREEMAP_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

export function useTreemapDistribution({ data, colorPalette }: UseTreemapDistributionOptions) {
  return useMemo(() => {
    const palette = colorPalette && colorPalette.length > 0 ? colorPalette : DEFAULT_TREEMAP_PALETTE;

    let total = 0;
    function sumNode(node: TreemapItem): number {
      if (node.children && node.children.length > 0) {
        return node.children.reduce((acc, child) => acc + sumNode(child), 0);
      }
      return node.value ?? node.size ?? 0;
    }

    for (const item of data) {
      total += sumNode(item);
    }

    // Enrich root items with colors and percentages
    const enrichedData = data.map((item, index) => {
      const itemValue = sumNode(item);
      const percent = total > 0 ? (itemValue / total) * 100 : 0;
      const color = palette[index % palette.length];

      return {
        ...item,
        value: item.value ?? item.size ?? itemValue,
        percent,
        color,
        children: item.children?.map((child, cIdx) => {
          const childVal = child.value ?? child.size ?? sumNode(child);
          return {
            ...child,
            value: childVal,
            percent: total > 0 ? (childVal / total) * 100 : 0,
            color: palette[(index + cIdx + 1) % palette.length],
          };
        }),
      };
    });

    return {
      total,
      enrichedData,
    };
  }, [data, colorPalette]);
}
