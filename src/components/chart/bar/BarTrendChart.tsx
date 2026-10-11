import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { BarTrendChartProps } from "./types";

import { ChartBrush } from "../shared/ChartBrush";
import { ChartReferenceLines } from "../shared/ChartReferenceLines";
import { ChartTooltip } from "../shared/ChartTooltip";
import {
  AXIS_TICK_STYLE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_CHART_MARGIN,
  DEFAULT_INITIAL_CHART_WIDTH,
} from "../shared/constants";
import { useBarTrend } from "./useBarTrend";

export const BarTrendChart = memo(function BarTrendChart(props: BarTrendChartProps) {
  const {
    data,
    dataKey = "value",
    xAxisKey = "label",
    secondaryDataKey,
    referenceLines,
    showBrush,
    height = 300,
    showGrid = true,
    showTooltip = true,
    className,
  } = props;

  const { containerRef, activeStroke, valueFormatter, xAxisFormatter, yAxisFormatter } = useBarTrend(props);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        initialDimension={{ width: DEFAULT_INITIAL_CHART_WIDTH, height }}
      >
        <BarChart data={data} margin={DEFAULT_CHART_MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID_STROKE} />}

          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={xAxisFormatter}
          />

          <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK_STYLE} tickFormatter={yAxisFormatter} />

          {showTooltip && <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />}

          <ChartReferenceLines lines={referenceLines} />

          <Bar
            dataKey={dataKey}
            fill={activeStroke}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            animationDuration={DEFAULT_ANIMATION_DURATION}
          />

          {secondaryDataKey && (
            <Bar
              dataKey={secondaryDataKey}
              fill="var(--chart-2)"
              opacity={0.7}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              animationDuration={DEFAULT_ANIMATION_DURATION}
            />
          )}

          <ChartBrush showBrush={showBrush} xAxisKey={xAxisKey} tickFormatter={xAxisFormatter} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
