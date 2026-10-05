import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WaterfallFinancialChartProps } from "./types";

import {
  AXIS_TICK_STYLE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_CHART_MARGIN,
  DEFAULT_INITIAL_CHART_WIDTH,
} from "../shared/constants";
import { useWaterfallFinancial } from "./useWaterfallFinancial";

export const WaterfallFinancialChart = memo(function WaterfallFinancialChart(
  props: WaterfallFinancialChartProps,
) {
  const { height = 320, showGrid = true, showTooltip = true, className } = props;

  const { containerRef, processedData, valueFormatter } = useWaterfallFinancial(props);

  const renderTooltip = (tooltipProps: any) => {
    const { active, payload } = tooltipProps;
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    if (!item) return null;

    const isPositive = item.rawVal > 0;
    const isNegative = item.rawVal < 0;

    return (
      <div className="border-border/60 bg-popover/95 text-popover-foreground rounded-lg border p-2.5 text-xs shadow-md backdrop-blur-xs select-none">
        <div className="flex items-center gap-2 font-semibold">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
          <span>{item.label}</span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">变动金额:</span>
            <span
              className={`font-mono font-medium ${
                isPositive && item.type === "increase"
                  ? "text-primary"
                  : isNegative || item.type === "decrease"
                    ? "text-destructive"
                    : "text-foreground"
              }`}
            >
              {item.rawVal > 0 && item.type === "increase" ? "+" : ""}
              {valueFormatter(item.rawVal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">当前累计:</span>
            <span className="text-foreground font-mono font-semibold">
              {valueFormatter(item.runningTotal)}
            </span>
          </div>
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
        initialDimension={{ width: DEFAULT_INITIAL_CHART_WIDTH, height }}
      >
        <BarChart data={processedData} margin={DEFAULT_CHART_MARGIN}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID_STROKE} />
          )}

          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK_STYLE} />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={valueFormatter}
          />

          {showTooltip && (
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: "color-mix(in oklab, var(--muted) 25%, transparent)" }}
            />
          )}

          {/* Invisible base bar for waterfall elevation */}
          <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />

          {/* Visible delta bar */}
          <Bar
            dataKey="delta"
            stackId="waterfall"
            radius={[4, 4, 4, 4]}
            maxBarSize={48}
            animationDuration={DEFAULT_ANIMATION_DURATION}
          >
            {processedData.map((entry, index) => (
              <Cell key={`waterfall-cell-${entry.label}_${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
