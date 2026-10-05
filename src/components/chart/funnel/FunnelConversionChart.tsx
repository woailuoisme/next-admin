import { memo } from "react";
import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";

import type { FunnelConversionChartProps } from "./types";

import { DEFAULT_ANIMATION_DURATION } from "../shared/constants";
import { useFunnelConversion } from "./useFunnelConversion";

export const FunnelConversionChart = memo(function FunnelConversionChart(
  props: FunnelConversionChartProps,
) {
  const {
    height = 320,
    showTooltip = true,
    showLabels = true,
    showRates = true,
    className,
  } = props;

  const { containerRef, processedData, valueFormatter } = useFunnelConversion(props);

  const renderCustomTooltip = (tooltipProps: any) => {
    const { active, payload } = tooltipProps;
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
  };

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        initialDimension={{ width: 500, height }}
      >
        <FunnelChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          {showTooltip && (
            <Tooltip content={renderCustomTooltip} cursor={{ fill: "transparent" }} />
          )}

          <Funnel
            dataKey="value"
            data={processedData}
            isAnimationActive
            animationDuration={DEFAULT_ANIMATION_DURATION}
          >
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
      </ResponsiveContainer>
    </div>
  );
});
