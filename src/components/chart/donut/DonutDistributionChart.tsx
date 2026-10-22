import { memo } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/lib/utils";

import type { DonutDistributionChartProps, EnrichedDonutSliceData } from "./types";

import { DEFAULT_ANIMATION_DURATION } from "../shared/constants";
import { useDonutDistribution } from "./useDonutDistribution";

interface DonutTooltipPayloadItem {
  payload: EnrichedDonutSliceData;
}

interface DonutTooltipContentProps {
  active?: boolean;
  payload?: DonutTooltipPayloadItem[];
  valueFormatter: (val: number) => string;
}

function DonutTooltipContent({ active, payload, valueFormatter }: DonutTooltipContentProps) {
  if (active && payload?.length) {
    const item = payload[0].payload;
    return (
      <div className="border-border/80 bg-background/95 rounded-lg border p-2.5 text-xs shadow-lg backdrop-blur-md">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-foreground font-semibold">{item.name}</span>
        </div>
        <p className="text-foreground font-mono font-bold">
          {valueFormatter(item.value)}{" "}
          <span className="text-muted-foreground font-normal">({item.percentage.toFixed(1)}%)</span>
        </p>
      </div>
    );
  }
  return null;
}

export const DonutDistributionChart = memo(function DonutDistributionChart(
  props: DonutDistributionChartProps,
) {
  const { innerRadius = 60, outerRadius = 85, height = 260, showLegend = true, className } = props;

  const { enrichedData, centerLabel, displayCenterValue, valueFormatter } = useDonutDistribution(props);

  return (
    <div
      className={cn("flex w-full flex-col items-center justify-between gap-6 md:flex-row", className)}
      style={{ minHeight: height }}
    >
      {/* Donut chart with centered text */}
      <div
        className="relative flex w-full shrink-0 items-center justify-center md:w-auto"
        style={{ width: height, height }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={height}
          initialDimension={{ width: height, height }}
        >
          <PieChart>
            <Tooltip content={<DonutTooltipContent valueFormatter={valueFormatter} />} />
            <Pie
              data={enrichedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              stroke="var(--background)"
              strokeWidth={2}
              animationDuration={DEFAULT_ANIMATION_DURATION}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center summary text overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-muted-foreground text-xs font-medium">{centerLabel}</span>
          <span className="text-foreground font-mono text-lg font-bold tracking-tight">
            {displayCenterValue}
          </span>
        </div>
      </div>

      {/* Legend list */}
      {showLegend && (
        <div className="max-h-[220px] w-full flex-1 space-y-2.5 overflow-y-auto pr-1">
          {enrichedData.map((item) => (
            <div
              key={item.name}
              className="hover:bg-muted/40 flex items-center justify-between rounded-md px-2 py-1 text-xs transition-colors"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-foreground truncate font-medium">{item.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-muted-foreground font-mono">{valueFormatter(item.value)}</span>
                <span className="text-foreground w-12 text-right font-mono font-medium">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
