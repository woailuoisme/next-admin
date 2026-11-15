"use client";

import { useTranslations } from "next-intl";

import { memo, useCallback, useMemo } from "react";
import { Scatter, ZAxis } from "recharts";

import type { ScatterMetricChartProps } from "./types";

import { CartesianScaffold } from "../shared/CartesianScaffold";
import { type ChartTooltipEntry, type ChartTooltipRow, useChartDetailTooltip } from "../shared/ChartTooltip";
import { DEFAULT_CHART_MARGIN } from "../shared/constants";
import { useScatterMetric } from "./useScatterMetric";

/** 气泡尺寸范围与光标默认值（模块级常量，避免每次渲染新建引用） */
const DEFAULT_Z_RANGE: [number, number] = [50, 450];
const SCATTER_TOOLTIP_CURSOR = { strokeDasharray: "3 3", stroke: "var(--border)" } as const;

interface ScatterTooltipPoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
  category?: string;
  fill?: string;
}

export const ScatterMetricChart = memo(function ScatterMetricChart(props: ScatterMetricChartProps) {
  const t = useTranslations("chart");
  const {
    xAxisName: rawXName,
    yAxisName: rawYName,
    zAxisName: rawZName,
    xAxisLabel,
    yAxisLabel,
    zAxisLabel,
    xReferenceLine,
    yReferenceLine,
    height,
    showGrid = true,
    showTooltip = true,
    isAnimationActive = true,
    zRange = DEFAULT_Z_RANGE,
    referenceLines: propReferenceLines,
    className,
  } = props;

  const xAxisName = rawXName || xAxisLabel || "X";
  const yAxisName = rawYName || yAxisLabel || "Y";
  const zAxisName = rawZName || zAxisLabel || t("scatter_z_axis");

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

  const { resolvedSeries, xFormatter, yFormatter, zFormatter } = useScatterMetric(props);

  const resolveTooltipDetail = useCallback(
    (payload: ReadonlyArray<ChartTooltipEntry>) => {
      const point = payload[0]?.payload as ScatterTooltipPoint | undefined;
      if (!point) return null;

      const rows: ChartTooltipRow[] = [
        { label: xAxisName, value: xFormatter(point.x), valueClassName: "font-medium" },
        { label: yAxisName, value: yFormatter(point.y), valueClassName: "font-medium" },
      ];
      if (point.z !== undefined) {
        rows.push({ label: zAxisName, value: zFormatter(point.z), valueClassName: "text-primary font-medium" });
      }

      return {
        title: point.name || point.category || t("scatter_data_point"),
        color: point.fill || "var(--primary)",
        rows,
      };
    },
    [t, xAxisName, xFormatter, yAxisName, yFormatter, zAxisName, zFormatter],
  );

  const renderTooltip = useChartDetailTooltip(resolveTooltipDetail);

  return (
    <CartesianScaffold
      chartType="scatter"
      height={height}
      defaultHeight={340}
      margin={DEFAULT_CHART_MARGIN}
      xAxisKey="x"
      xAxisType="number"
      xAxisName={xAxisName}
      xAxisFormatter={xFormatter}
      yAxisKey="y"
      yAxisType="number"
      yAxisName={yAxisName}
      yAxisFormatter={yFormatter}
      showGrid={showGrid}
      gridVertical
      showTooltip={showTooltip}
      referenceLines={referenceLines}
      tooltipContent={renderTooltip}
      tooltipCursor={SCATTER_TOOLTIP_CURSOR}
      className={className}
    >
      <ZAxis type="number" dataKey="z" range={zRange} name={zAxisName} />

      {resolvedSeries.map((series) => (
        <Scatter
          key={series.name}
          name={series.name}
          data={series.data}
          fill={series.fill}
          fillOpacity={0.85}
          isAnimationActive={isAnimationActive}
        />
      ))}
    </CartesianScaffold>
  );
});
