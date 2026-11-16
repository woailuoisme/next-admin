"use client";

import { memo, useCallback, useMemo } from "react";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from "recharts";

import type { RadarMetricChartProps } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartHeight } from "../shared/ChartContext";
import { ChartFrame } from "../shared/ChartFrame";
import { ChartTooltip, type ChartTooltipEntry } from "../shared/ChartTooltip";
import {
  AXIS_TICK_STYLE_COMPACT,
  CHART_AXIS_STROKE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_RADAR_CHART_MARGIN,
  EMPTY_DATA,
  RADAR_RADIUS_TICK_STYLE,
} from "../shared/constants";
import { resolveNumericChartHeight } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

const RADAR_RADIUS_AXIS_LINE = { stroke: CHART_AXIS_STROKE } as const;

export const RadarMetricChart = memo(function RadarMetricChart({
  data,
  series = EMPTY_DATA,
  subjectKey = "subject",
  maxDomain = 100,
  height,
  valueFormatter: propValueFormatter,
  showTooltip = true,
  showRadiusAxis = false,
  showRadiusTicks = false,
  isAnimationActive = true,
  ariaLabel,
  className,
}: RadarMetricChartProps) {
  const effectiveAnimationActive = useChartAnimation(isAnimationActive);
  const resolvedHeight = useChartHeight(height, 300);
  const numericHeight = resolveNumericChartHeight(resolvedHeight, 300);
  const { valueFormatter } = useChartFormatters({ valueFormatter: propValueFormatter });

  const normalizedSeries = useMemo(
    () =>
      series.map((s, idx) => ({
        ...s,
        color: s.color || CHART_PALETTE[idx % CHART_PALETTE.length],
        fillOpacity: s.fillOpacity ?? 0.25,
      })),
    [series],
  );

  const radiusDomain = useMemo<[number, number]>(() => [0, maxDomain], [maxDomain]);

  const renderTooltip = useCallback(
    (tooltipProps: { active?: boolean; payload?: ReadonlyArray<unknown>; label?: string | number }) => (
      <ChartTooltip
        active={tooltipProps.active}
        payload={tooltipProps.payload as ReadonlyArray<ChartTooltipEntry> | undefined}
        label={tooltipProps.label}
        valueFormatter={valueFormatter}
      />
    ),
    [valueFormatter],
  );

  return (
    <ChartFrame height={resolvedHeight} ariaLabel={ariaLabel} className={className} initialWidth={numericHeight}>
      <RadarChart data={data} margin={DEFAULT_RADAR_CHART_MARGIN}>
        <PolarGrid stroke={CHART_GRID_STROKE} />

        <PolarAngleAxis dataKey={subjectKey} tick={AXIS_TICK_STYLE_COMPACT} />

        <PolarRadiusAxis
          angle={30}
          domain={radiusDomain}
          tick={showRadiusTicks ? RADAR_RADIUS_TICK_STYLE : false}
          axisLine={showRadiusAxis ? RADAR_RADIUS_AXIS_LINE : false}
        />

        {showTooltip && <Tooltip content={renderTooltip} />}

        {normalizedSeries.map((s) => (
          <Radar
            key={s.dataKey}
            name={s.name}
            dataKey={s.dataKey}
            stroke={s.color}
            fill={s.color}
            fillOpacity={s.fillOpacity}
            strokeWidth={2}
            isAnimationActive={effectiveAnimationActive}
            animationDuration={DEFAULT_ANIMATION_DURATION}
          />
        ))}
      </RadarChart>
    </ChartFrame>
  );
});
