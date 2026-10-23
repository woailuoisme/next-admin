import { memo } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import type { AreaTrendChartProps } from "./types";

import { ChartBrush } from "../shared/ChartBrush";
import { ChartReferenceLines } from "../shared/ChartReferenceLines";
import { ChartTooltip } from "../shared/ChartTooltip";
import {
  AXIS_TICK_STYLE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_CHART_MARGIN,
} from "../shared/constants";
import { ChartFrame } from "../shared/ChartFrame";
import { useAreaTrend } from "./useAreaTrend";

export const AreaTrendChart = memo(function AreaTrendChart(props: AreaTrendChartProps) {
  const {
    data,
    dataKey = "value",
    xAxisKey = "label",
    secondaryDataKey,
    height = 300,
    showGrid = true,
    showTooltip = true,
    referenceLines,
    showBrush,
    className,
  } = props;

  const { activeStroke, gradientId, secondaryGradId, valueFormatter, xAxisFormatter, yAxisFormatter } =
    useAreaTrend(props);

  return (
    <ChartFrame height={height} className={className}>
      <AreaChart data={data} margin={DEFAULT_CHART_MARGIN}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={activeStroke} stopOpacity={0.35} />
            <stop offset="95%" stopColor={activeStroke} stopOpacity={0.0} />
          </linearGradient>
          {secondaryDataKey && (
            <linearGradient id={secondaryGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
            </linearGradient>
          )}
        </defs>

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

        {secondaryDataKey && (
          <Area
            type="monotone"
            dataKey={secondaryDataKey}
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill={`url(#${secondaryGradId})`}
            animationDuration={DEFAULT_ANIMATION_DURATION}
          />
        )}

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={activeStroke}
          strokeWidth={2.5}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          animationDuration={DEFAULT_ANIMATION_DURATION}
        />

        <ChartBrush showBrush={showBrush} xAxisKey={xAxisKey} tickFormatter={xAxisFormatter} />
      </AreaChart>
    </ChartFrame>
  );
});
