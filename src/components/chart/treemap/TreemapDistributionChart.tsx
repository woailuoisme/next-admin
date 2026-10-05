import { memo } from "react";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

import { cn } from "@/lib/utils";

import type { ValueFormatter } from "../shared/formatters";
import type { TreemapDistributionChartProps } from "./types";

import { CHART_ON_FILL_TEXT } from "../shared/constants";
import { formatNumber } from "../shared/formatters";
import { useTreemapDistribution } from "./useTreemapDistribution";

interface CustomContentProps {
  root?: unknown;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
  color?: string;
  percent?: number;
  valueFormatter?: ValueFormatter;
}

const CustomTreemapNode = (props: CustomContentProps) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = "",
    value = 0,
    color = "var(--chart-1)",
    percent,
    valueFormatter = (val: number) => formatNumber(val),
  } = props;

  // Don't render tiny sub-pixels
  if (width < 4 || height < 4) return null;

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
};

export const TreemapDistributionChart = memo(function TreemapDistributionChart({
  data,
  height = 300,
  valueFormatter = (val: number) => formatNumber(val),
  colorPalette,
  aspectRatio = 1.618,
  showTooltip = true,
  nodeGap: _nodeGap = 2,
  className,
}: TreemapDistributionChartProps) {
  const { enrichedData, total } = useTreemapDistribution({
    data,
    colorPalette,
  });

  return (
    <div className={cn("w-full overflow-hidden select-none", className)} style={{ height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        initialDimension={{ width: 500, height }}
      >
        <Treemap
          data={enrichedData}
          dataKey="value"
          nameKey="name"
          aspectRatio={aspectRatio}
          isAnimationActive={false}
          content={<CustomTreemapNode valueFormatter={valueFormatter} />}
        >
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload;
                if (!item) return null;

                const itemValue = Number(item.value) || 0;
                const percent = item.percent ?? (total > 0 ? (itemValue / total) * 100 : 0);

                return (
                  <div className="border-border/50 bg-background/95 rounded-lg border px-3 py-2 text-xs shadow-xl backdrop-blur-md">
                    <div className="text-foreground flex items-center gap-2 font-medium">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: item.color || "var(--chart-1)",
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-muted-foreground">数值:</span>
                      <span className="text-foreground font-semibold tabular-nums">
                        {valueFormatter(itemValue)}
                      </span>
                      <span className="text-muted-foreground text-xs">({percent.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
});
