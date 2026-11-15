"use client";

import { useTranslations } from "next-intl";

import { memo, useCallback } from "react";
import { Tooltip, Treemap, type TreemapNode } from "recharts";

import { cn } from "cn";

import type { ValueFormatter } from "../shared/formatters";
import type { TreemapDistributionChartProps } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartHeight } from "../shared/ChartContext";
import { ChartFrame } from "../shared/ChartFrame";
import { type ChartTooltipEntry, useChartDetailTooltip } from "../shared/ChartTooltip";
import { CHART_ON_FILL_TEXT } from "../shared/constants";
import { defaultNumberFormatter, toFiniteNumber } from "../shared/formatters";
import { useTreemapDistribution } from "./useTreemapDistribution";

interface CustomContentProps extends Partial<TreemapNode> {
  color?: string;
  percent?: number;
  valueFormatter?: ValueFormatter;
}

const CustomTreemapNode = memo(function CustomTreemapNode(props: CustomContentProps) {
  const {
    depth = 0,
    children,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = "",
    value = 0,
    color = "var(--chart-1)",
    percent,
    valueFormatter = defaultNumberFormatter,
  } = props;

  const hasChildren = Array.isArray(children) && children.length > 0;

  // Skip root wrapper (depth 0), branch containers wrapping child tiles, and sub-pixel nodes
  if (depth === 0 || hasChildren || width < 4 || height < 4) return null;

  const canShowTitle = width >= 48 && height >= 22;
  const canShowValue = width >= 64 && height >= 40;

  return (
    <g className="transition-all duration-150">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={color}
        fillOpacity={0.85}
        stroke="var(--background)"
        strokeWidth={2}
        className="cursor-pointer transition-all hover:opacity-100 hover:brightness-110"
      />
      {canShowTitle && (
        <text
          x={x + 8}
          y={y + 16}
          fill={CHART_ON_FILL_TEXT}
          fontSize={11}
          fontWeight={600}
          className="pointer-events-none tracking-tight select-none"
        >
          {name.length > 10 && width < 90 ? `${name.slice(0, 8)}…` : name}
        </text>
      )}
      {canShowValue && (
        <text
          x={x + 8}
          y={y + 32}
          fill={CHART_ON_FILL_TEXT}
          fillOpacity={0.85}
          fontSize={10}
          className="pointer-events-none tabular-nums select-none"
        >
          {valueFormatter(value)} {percent != null ? `(${percent.toFixed(1)}%)` : ""}
        </text>
      )}
    </g>
  );
});

interface TreemapTooltipItem {
  name: string;
  value: number;
  color?: string;
  percent?: number;
}

export const TreemapDistributionChart = memo(function TreemapDistributionChart({
  data,
  height,
  valueFormatter: customValueFormatter,
  colorPalette,
  aspectRatio = 1.618,
  showTooltip = true,
  isAnimationActive = false,
  className,
}: TreemapDistributionChartProps) {
  const t = useTranslations("chart");
  const resolvedHeight = useChartHeight(height, 300);
  const { valueFormatter } = useChartFormatters({ valueFormatter: customValueFormatter });
  const { enrichedData, total } = useTreemapDistribution({
    data,
    colorPalette,
  });

  const resolveTooltipDetail = useCallback(
    (payload: ReadonlyArray<ChartTooltipEntry>) => {
      const item = payload[0]?.payload as TreemapTooltipItem | undefined;
      if (!item) return null;
      const itemValue = toFiniteNumber(item.value, 0);
      const percent = item.percent ?? (total > 0 ? (itemValue / total) * 100 : 0);

      return {
        title: item.name,
        color: item.color || "var(--chart-1)",
        rows: [
          {
            label: t("treemap_value"),
            value: `${valueFormatter(itemValue)} (${percent.toFixed(1)}%)`,
          },
        ],
      };
    },
    [t, total, valueFormatter],
  );

  const renderTooltip = useChartDetailTooltip(resolveTooltipDetail);
  const renderTreemapNode = useCallback(
    (nodeProps: TreemapNode) => (
      <CustomTreemapNode
        {...nodeProps}
        color={typeof nodeProps.color === "string" ? nodeProps.color : undefined}
        percent={typeof nodeProps.percent === "number" ? nodeProps.percent : undefined}
        valueFormatter={valueFormatter}
      />
    ),
    [valueFormatter],
  );

  return (
    <ChartFrame height={resolvedHeight} className={cn("w-full overflow-hidden select-none", className)}>
      <Treemap
        data={enrichedData}
        dataKey="value"
        nameKey="name"
        aspectRatio={aspectRatio}
        isAnimationActive={isAnimationActive}
        content={renderTreemapNode}
      >
        {showTooltip && <Tooltip content={renderTooltip} />}
      </Treemap>
    </ChartFrame>
  );
});
