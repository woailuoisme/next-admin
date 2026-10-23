import { memo } from "react";
import { Funnel, FunnelChart, LabelList, Tooltip } from "recharts";

import type { FunnelConversionChartProps } from "./types";

import { DEFAULT_ANIMATION_DURATION } from "../shared/constants";
import { ChartFrame } from "../shared/ChartFrame";
import { useFunnelConversion } from "./useFunnelConversion";

interface FunnelTooltipItem {
  name: string;
  value: number;
  fill: string;
  conversionRate: number;
  dropoffRate: number;
}

interface FunnelTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    payload?: FunnelTooltipItem;
  }>;
  valueFormatter: (value: number) => string;
}

const FunnelTooltipContent = memo(function FunnelTooltipContent({
  active,
  payload,
  valueFormatter,
}: FunnelTooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="border-border/60 bg-popover/95 text-popover-foreground rounded-lg border p-2.5 text-xs shadow-md backdrop-blur-xs select-none">
      <div className="flex items-center gap-2 font-semibold">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
        <span>{item.name}</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">阶段数值:</span>
          <span className="font-mono font-medium">{valueFormatter(item.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">总体留存:</span>
          <span className="text-primary font-mono font-semibold">{item.conversionRate}%</span>
        </div>
        {item.dropoffRate > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">上阶段流失:</span>
            <span className="text-destructive font-mono font-medium">-{item.dropoffRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
});

export const FunnelConversionChart = memo(function FunnelConversionChart(props: FunnelConversionChartProps) {
  const { height = 320, showTooltip = true, showLabels = true, showRates = true, className } = props;

  const { processedData, valueFormatter } = useFunnelConversion(props);

  return (
    <ChartFrame height={height} className={className}>
      <FunnelChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        {showTooltip && (
          <Tooltip
            content={<FunnelTooltipContent valueFormatter={valueFormatter} />}
            cursor={{ fill: "transparent" }}
          />
        )}

        <Funnel dataKey="value" data={processedData} isAnimationActive animationDuration={DEFAULT_ANIMATION_DURATION}>
          {showLabels && (
            <LabelList
              position="right"
              fill="var(--foreground)"
              stroke="none"
              dataKey="name"
              className="text-xs font-medium"
            />
          )}
          {showRates && (
            <LabelList
              position="left"
              fill="var(--muted-foreground)"
              stroke="none"
              dataKey="conversionRate"
              formatter={(val: unknown) => `${val}%`}
              className="font-mono text-[11px]"
            />
          )}
        </Funnel>
      </FunnelChart>
    </ChartFrame>
  );
});
