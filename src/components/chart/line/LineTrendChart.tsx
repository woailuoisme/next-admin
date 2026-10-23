import { memo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

import type { LineTrendChartProps } from "./types";

import { ChartBrush } from "../shared/ChartBrush";
import { ChartReferenceLines } from "../shared/ChartReferenceLines";
import { ChartTooltip } from "../shared/ChartTooltip";
import {
  AXIS_TICK_STYLE,
  CHART_GRID_STROKE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_CHART_MARGIN,
  DEFAULT_LINE_ACTIVE_DOT_BASE,
  DEFAULT_LINE_DOT,
  DEFAULT_REFERENCE_STROKE,
} from "../shared/constants";
import { ChartFrame } from "../shared/ChartFrame";
import { useLineTrend } from "./useLineTrend";

export const LineTrendChart = memo(function LineTrendChart(props: LineTrendChartProps) {
  const {
    data,
    xAxisKey = "label",
    referenceValue,
    referenceLines,
    showBrush,
    curveType = "monotone",
    showDots = false,
    height = 300,
    showGrid = true,
    showTooltip = true,
    className,
  } = props;

  const { normalizedSeries, formattedReferenceLabel, valueFormatter, xAxisFormatter, yAxisFormatter } =
    useLineTrend(props);

  return (
    <ChartFrame height={height} className={className}>
      <LineChart data={data} margin={DEFAULT_CHART_MARGIN}>
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

        {typeof referenceValue === "number" && (
          <ReferenceLine
            y={referenceValue}
            stroke={DEFAULT_REFERENCE_STROKE}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: formattedReferenceLabel,
              fill: DEFAULT_REFERENCE_STROKE,
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
        )}

        <ChartReferenceLines lines={referenceLines} />

        {normalizedSeries.map((s) => (
          <Line
            key={s.dataKey}
            type={curveType}
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={s.strokeWidth}
            strokeDasharray={s.strokeDasharray}
            animationDuration={DEFAULT_ANIMATION_DURATION}
            dot={showDots ? DEFAULT_LINE_DOT : false}
            activeDot={{
              ...DEFAULT_LINE_ACTIVE_DOT_BASE,
              stroke: s.color,
            }}
          />
        ))}

        <ChartBrush showBrush={showBrush} xAxisKey={xAxisKey} tickFormatter={xAxisFormatter} />
      </LineChart>
    </ChartFrame>
  );
});
