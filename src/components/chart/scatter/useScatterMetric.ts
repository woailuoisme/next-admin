import { useMemo } from "react";

import { useFormatter } from "next-intl";

import type { ScatterMetricChartProps, ScatterPoint, ScatterSeries } from "./types";

import { CHART_PALETTE } from "../shared/theme";

export function useScatterMetric(props: ScatterMetricChartProps) {
  const {
    data,
    series: propSeries,
    xAxisKey = "x",
    yAxisKey = "y",
    zAxisKey = "z",
    nameKey = "name",
    categoryKey = "category",
    xFormatter: customXFormatter,
    yFormatter: customYFormatter,
    zFormatter: customZFormatter,
    xValueFormatter,
    yValueFormatter,
    zValueFormatter,
  } = props;

  const resolvedSeries = useMemo<ScatterSeries[]>(() => {
    if (propSeries && propSeries.length > 0) {
      return propSeries.map((s, idx) => ({
        ...s,
        data: s.data.map((point: Record<string, unknown>) => ({
          ...point,
          x: Number(point[xAxisKey] ?? point.x ?? 0),
          y: Number(point[yAxisKey] ?? point.y ?? 0),
          z:
            point[zAxisKey] !== undefined
              ? Number(point[zAxisKey])
              : point.z !== undefined
                ? Number(point.z)
                : undefined,
          name: String(point[nameKey] ?? point.name ?? ""),
          category: point[categoryKey]
            ? String(point[categoryKey])
            : point.category
              ? String(point.category)
              : undefined,
        })),
        fill: s.fill || CHART_PALETTE[idx % CHART_PALETTE.length],
      }));
    }

    if (data && data.length > 0) {
      const normalizedPoints: ScatterPoint[] = data.map((point: Record<string, unknown>) => ({
        ...point,
        x: Number(point[xAxisKey] ?? point.x ?? 0),
        y: Number(point[yAxisKey] ?? point.y ?? 0),
        z:
          point[zAxisKey] !== undefined ? Number(point[zAxisKey]) : point.z !== undefined ? Number(point.z) : undefined,
        name: String(point[nameKey] ?? point.name ?? ""),
        category: point[categoryKey] ? String(point[categoryKey]) : point.category ? String(point.category) : undefined,
      }));

      // Group by category if present
      const hasCategories = normalizedPoints.some((d) => Boolean(d.category));
      if (hasCategories) {
        const map = new Map<string, typeof normalizedPoints>();
        for (const point of normalizedPoints) {
          const cat = point.category || "默认";
          if (!map.has(cat)) map.set(cat, []);
          map.get(cat)!.push(point);
        }

        return Array.from(map.entries()).map(([cat, points], idx) => ({
          name: cat,
          data: points,
          fill: CHART_PALETTE[idx % CHART_PALETTE.length],
        }));
      }

      return [
        {
          name: "指标分布",
          data: normalizedPoints,
          fill: "var(--primary)",
        },
      ];
    }

    return [];
  }, [data, propSeries, xAxisKey, yAxisKey, zAxisKey, nameKey, categoryKey]);

  const format = useFormatter();
  const formatNumber = (val: number) => format.number(val);
  const xFormatter = customXFormatter ?? xValueFormatter ?? formatNumber;
  const yFormatter = customYFormatter ?? yValueFormatter ?? formatNumber;
  const zFormatter = customZFormatter ?? zValueFormatter ?? formatNumber;

  return {
    resolvedSeries,
    xFormatter,
    yFormatter,
    zFormatter,
  };
}
