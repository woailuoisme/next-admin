import { memo } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import type { ComposedTrendChartProps } from "./types";

import { ChartBrush } from "../shared/ChartBrush";
import { ChartReferenceLines } from "../shared/ChartReferenceLines";
import { ChartTooltip } from "../shared/ChartTooltip";
import {
  AXIS_TICK_STYLE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_COMPOSED_MARGIN,
  DEFAULT_COMPOSED_MARGIN_WITH_RIGHT,
  DEFAULT_LINE_ACTIVE_DOT_BASE,
  DEFAULT_LINE_DOT,
} from "../shared/constants";
import { ChartFrame } from "../shared/ChartFrame";
import { useComposedTrend } from "./useComposedTrend";

export const ComposedTrendChart = memo(function ComposedTrendChart(props: ComposedTrendChartProps) {
  const {
    data,
    xAxisKey = "label",
    referenceLines,
    showBrush,
    height = 320,
    showGrid = true,
    showTooltip = true,
    className,
  } = props;

  const { hasRightAxis, normalizedBars, normalizedLines, leftAxisFormatter, rightAxisFormatter, valueFormatter } =
    useComposedTrend(props);

  const chartMargin = hasRightAxis ? DEFAULT_COMPOSED_MARGIN_WITH_RIGHT : DEFAULT_COMPOSED_MARGIN;

  return (
    <ChartFrame height={height} className={className}>
      <ComposedChart data={data} margin={chartMargin}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID_STROKE} />}

        <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={AXIS_TICK_STYLE} />

        {/* Left Y Axis */}
        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK_STYLE}
          tickFormatter={leftAxisFormatter}
        />

        {/* Right Y Axis */}
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={rightAxisFormatter}
          />
        )}

        {showTooltip && <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />}

        <ChartReferenceLines lines={referenceLines} />

        {/* Render Bars */}
        {normalizedBars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            yAxisId={bar.yAxisId}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            animationDuration={DEFAULT_ANIMATION_DURATION}
          />
        ))}

        {/* Render Lines */}
        {normalizedLines.map((line) => (
          <Line
            key={line.dataKey}
            dataKey={line.dataKey}
            name={line.name}
            yAxisId={line.yAxisId}
            type="monotone"
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            strokeDasharray={line.strokeDasharray}
            animationDuration={DEFAULT_ANIMATION_DURATION}
            dot={DEFAULT_LINE_DOT}
            activeDot={{
              ...DEFAULT_LINE_ACTIVE_DOT_BASE,
              stroke: line.color,
            }}
          />
        ))}

        <ChartBrush showBrush={showBrush} xAxisKey={xAxisKey} />
      </ComposedChart>
    </ChartFrame>
  );
});
