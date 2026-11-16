"use client";

import { memo } from "react";

import { Bar, Line } from "recharts";

import type { ComposedTrendChartProps } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { CartesianScaffold } from "../shared/CartesianScaffold";
import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_COMPOSED_MARGIN,
  DEFAULT_COMPOSED_MARGIN_WITH_RIGHT,
  DEFAULT_LINE_DOT,
} from "../shared/constants";
import { useComposedTrend } from "./useComposedTrend";

const COMPOSED_BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

export const ComposedTrendChart = memo(function ComposedTrendChart(props: ComposedTrendChartProps) {
  const {
    data,
    xAxisKey = "label",
    xAxisFormatter,
    referenceLines,
    showBrush,
    height,
    showGrid = true,
    showTooltip = true,
    isAnimationActive = true,
    ariaLabel,
    className,
  } = props;
  const effectiveAnimationActive = useChartAnimation(isAnimationActive);

  const { hasRightAxis, normalizedBars, normalizedLines, leftAxisFormatter, rightAxisFormatter, valueFormatter } =
    useComposedTrend(props);

  const chartMargin = hasRightAxis ? DEFAULT_COMPOSED_MARGIN_WITH_RIGHT : DEFAULT_COMPOSED_MARGIN;

  return (
    <CartesianScaffold
      chartType="composed"
      data={data}
      height={height}
      defaultHeight={320}
      margin={chartMargin}
      xAxisKey={xAxisKey}
      xAxisFormatter={xAxisFormatter}
      yAxisId="left"
      yAxisFormatter={leftAxisFormatter}
      rightAxisFormatter={hasRightAxis ? rightAxisFormatter : undefined}
      valueFormatter={valueFormatter}
      showGrid={showGrid}
      showTooltip={showTooltip}
      referenceLines={referenceLines}
      showBrush={showBrush}
      ariaLabel={ariaLabel}
      className={className}
    >
      {normalizedBars.map((bar) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          name={bar.name}
          yAxisId={bar.yAxisId}
          fill={bar.color}
          radius={COMPOSED_BAR_RADIUS}
          maxBarSize={36}
          isAnimationActive={effectiveAnimationActive}
          animationDuration={DEFAULT_ANIMATION_DURATION}
        />
      ))}

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
          isAnimationActive={effectiveAnimationActive}
          animationDuration={DEFAULT_ANIMATION_DURATION}
          dot={DEFAULT_LINE_DOT}
          activeDot={line.activeDot}
        />
      ))}
    </CartesianScaffold>
  );
});
