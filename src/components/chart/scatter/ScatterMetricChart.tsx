import { memo, useMemo } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { ScatterMetricChartProps } from "./types";

import {
  AXIS_TICK_STYLE,
  CHART_GRID_STROKE,
  DEFAULT_CHART_MARGIN,
  DEFAULT_INITIAL_CHART_WIDTH,
} from "../shared/constants";
import { useScatterMetric } from "./useScatterMetric";

/** 气泡尺寸范围的默认值（模块级常量，避免每次渲染新建数组） */
const DEFAULT_Z_RANGE: [number, number] = [50, 450];

interface ScatterTooltipPoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
  category?: string;
  fill?: string;
}

interface ScatterTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    payload?: ScatterTooltipPoint;
  }>;
  xAxisName: string;
  yAxisName: string;
  zAxisName: string;
  xFormatter: (val: number) => string;
  yFormatter: (val: number) => string;
  zFormatter: (val: number) => string;
}

const ScatterTooltipContent = memo(function ScatterTooltipContent({
  active,
  payload,
  xAxisName,
  yAxisName,
  zAxisName,
  xFormatter,
  yFormatter,
  zFormatter,
}: ScatterTooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="border-border/60 bg-popover/95 text-popover-foreground rounded-lg border p-2.5 text-xs shadow-md backdrop-blur-xs select-none">
      <div className="flex items-center gap-2 font-semibold">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: point.fill || "var(--primary)" }} />
        <span>{point.name || point.category || "数据点"}</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{xAxisName}:</span>
          <span className="font-mono font-medium">{xFormatter(point.x)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{yAxisName}:</span>
          <span className="font-mono font-medium">{yFormatter(point.y)}</span>
        </div>
        {point.z !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{zAxisName}:</span>
            <span className="text-primary font-mono font-medium">{zFormatter(point.z)}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export const ScatterMetricChart = memo(function ScatterMetricChart(props: ScatterMetricChartProps) {
  const {
    xAxisName: rawXName,
    yAxisName: rawYName,
    zAxisName: rawZName,
    xAxisLabel,
    yAxisLabel,
    zAxisLabel,
    xReferenceLine,
    yReferenceLine,
    height = 340,
    showGrid = true,
    showTooltip = true,
    zRange = DEFAULT_Z_RANGE,
    referenceLines: propReferenceLines,
    className,
  } = props;

  const xAxisName = rawXName || xAxisLabel || "X";
  const yAxisName = rawYName || yAxisLabel || "Y";
  const zAxisName = rawZName || zAxisLabel || "权重";

  const referenceLines = useMemo(
    () => [
      ...(propReferenceLines || []),
      ...(xReferenceLine !== undefined
        ? [{ x: xReferenceLine, stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }]
        : []),
      ...(yReferenceLine !== undefined
        ? [{ y: yReferenceLine, stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }]
        : []),
    ],
    [propReferenceLines, xReferenceLine, yReferenceLine],
  );

  const { containerRef, resolvedSeries, xFormatter, yFormatter, zFormatter } = useScatterMetric(props);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        initialDimension={{ width: DEFAULT_INITIAL_CHART_WIDTH, height }}
      >
        <ScatterChart margin={DEFAULT_CHART_MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />}

          <XAxis
            type="number"
            dataKey="x"
            name={xAxisName}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={xFormatter}
          />

          <YAxis
            type="number"
            dataKey="y"
            name={yAxisName}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={yFormatter}
          />

          <ZAxis type="number" dataKey="z" range={zRange} name={zAxisName} />

          {referenceLines?.map((refLine, idx) => (
            <ReferenceLine
              key={`scatter-ref-line-${idx}`}
              x={refLine.x}
              y={refLine.y}
              stroke={refLine.stroke || "color-mix(in oklab, var(--border) 80%, transparent)"}
              strokeDasharray={refLine.strokeDasharray || "4 4"}
              strokeWidth={refLine.strokeWidth ?? 1.5}
              label={
                refLine.label
                  ? {
                      value: refLine.label,
                      fill: "var(--muted-foreground)",
                      fontSize: 10,
                      position: refLine.position || "insideTopRight",
                    }
                  : undefined
              }
            />
          ))}

          {showTooltip && (
            <Tooltip
              content={
                <ScatterTooltipContent
                  xAxisName={xAxisName}
                  yAxisName={yAxisName}
                  zAxisName={zAxisName}
                  xFormatter={xFormatter}
                  yFormatter={yFormatter}
                  zFormatter={zFormatter}
                />
              }
              cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
            />
          )}

          {resolvedSeries.map((series) => (
            <Scatter
              key={series.name}
              name={series.name}
              data={series.data}
              fill={series.fill}
              fillOpacity={0.85}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
});
