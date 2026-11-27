"use client";

import type { TreemapItem } from "./types";

import { toFiniteNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

interface UseTreemapDistributionOptions {
  data: TreemapItem[];
  colorPalette?: string[];
}

interface WeightedTreemapNode extends TreemapItem {
  value: number;
  color: string;
  children?: WeightedTreemapNode[];
}

export interface EnrichedTreemapNode extends WeightedTreemapNode {
  percent: number;
  children?: EnrichedTreemapNode[];
}

/**
 * Single post-order traversal aggregating leaf values and assigning palette colors in O(N).
 */
function buildWeightedNode(node: TreemapItem, palette: string[], paletteIndex: number): WeightedTreemapNode {
  const color = palette[paletteIndex % palette.length];
  if (node.children && node.children.length > 0) {
    const weightedChildren = node.children.map((child, childIndex) =>
      buildWeightedNode(child, palette, paletteIndex + childIndex + 1),
    );
    const value = weightedChildren.reduce((acc, child) => acc + child.value, 0);
    return {
      ...node,
      value,
      color,
      children: weightedChildren,
    };
  }

  return {
    ...node,
    value: Math.max(0, toFiniteNumber(node.value ?? node.size, 0)),
    color,
    children: undefined,
  };
}

function applyPercent(node: WeightedTreemapNode, total: number): EnrichedTreemapNode {
  return {
    ...node,
    percent: total > 0 ? (node.value / total) * 100 : 0,
    children: node.children?.map((child) => applyPercent(child, total)),
  };
}

export function useTreemapDistribution({ data, colorPalette }: UseTreemapDistributionOptions) {
  const safeData = data ?? [];
  const palette = colorPalette && colorPalette.length > 0 ? colorPalette : CHART_PALETTE;

  const weightedNodes = safeData.map((item, index) => buildWeightedNode(item, palette, index));
  const total = weightedNodes.reduce((acc, item) => acc + item.value, 0);
  const enrichedData = weightedNodes.map((node) => applyPercent(node, total));

  return {
    total,
    enrichedData,
  };
}
