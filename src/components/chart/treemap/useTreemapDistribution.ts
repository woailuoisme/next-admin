import { useMemo } from "react";

import type { TreemapItem } from "./types";

import { toFiniteNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

interface UseTreemapDistributionOptions {
  data: TreemapItem[];
  colorPalette?: string[];
}

export function useTreemapDistribution({ data, colorPalette }: UseTreemapDistributionOptions) {
  return useMemo(() => {
    const safeData = data ?? [];
    const palette = colorPalette && colorPalette.length > 0 ? colorPalette : CHART_PALETTE;

    let total = 0;
    function sumNode(node: TreemapItem): number {
      if (node.children && node.children.length > 0) {
        return node.children.reduce((acc, child) => acc + sumNode(child), 0);
      }
      return Math.max(0, toFiniteNumber(node.value ?? node.size, 0));
    }

    for (const item of safeData) {
      total += sumNode(item);
    }

    // Recursively enrich hierarchy items with computed totals, percentages, and palette colors
    function enrichNode(
      node: TreemapItem,
      paletteIndex: number,
    ): TreemapItem & {
      value: number;
      percent: number;
      color: string;
    } {
      const nodeValue = sumNode(node);
      const percent = total > 0 ? (nodeValue / total) * 100 : 0;
      const color = palette[paletteIndex % palette.length];

      return {
        ...node,
        value: nodeValue,
        percent,
        color,
        children: node.children?.map((child, childIndex) => enrichNode(child, paletteIndex + childIndex + 1)),
      };
    }

    const enrichedData = safeData.map((item, index) => enrichNode(item, index));

    return {
      total,
      enrichedData,
    };
  }, [data, colorPalette]);
}
