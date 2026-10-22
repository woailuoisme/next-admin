import { memo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { RadarMetricChartProps } from "./types";

import { ChartTooltip } from "../shared/ChartTooltip";
import {
  AXIS_TICK_STYLE_COMPACT,
  CHART_AXIS_STROKE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_RADAR_CHART_MARGIN,
  RADAR_RADIUS_TICK_STYLE,
} from "../shared/constants";
import { useRadarMetric } from "./useRadarMetric";

export const RadarMetricChart = memo(function RadarMetricChart(props: RadarMetricChartProps) {
  const {
    data,
    maxDomain = 100,
    height = 300,
    showTooltip = true,
    showRadiusAxis = false,
    showRadiusTicks = false,
    className,
  } = props;

  const { normalizedSeries, valueFormatter } = useRadarMetric(props);

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        initialDimension={{ width: height, height }}
      >
        <RadarChart data={data} margin={DEFAULT_RADAR_CHART_MARGIN}>
          <PolarGrid stroke={CHART_GRID_STROKE} />

          <PolarAngleAxis dataKey="subject" tick={AXIS_TICK_STYLE_COMPACT} />

          <PolarRadiusAxis
            angle={30}
            domain={[0, maxDomain]}
            tick={showRadiusTicks ? RADAR_RADIUS_TICK_STYLE : false}
            axisLine={showRadiusAxis ? { stroke: CHART_AXIS_STROKE } : false}
          />

          {showTooltip && <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />}

          {normalizedSeries.map((s) => (
            <Radar
              key={s.dataKey}
              name={s.name}
              dataKey={s.dataKey}
              stroke={s.color}
              fill={s.color}
              fillOpacity={s.fillOpacity}
              strokeWidth={2}
              animationDuration={DEFAULT_ANIMATION_DURATION}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
