"use client";

import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";

import type { ScatterMetricChartProps, ScatterPoint, ScatterSeries } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { toFiniteNumber } from "../shared/formatters";
import { CHART_PALETTE } from "../shared/theme";

function normalizeScatterPoint(
  point: Record<string, unknown>,
  xAxisKey: string,
  yAxisKey: string,
  zAxisKey: string,
  nameKey: string,
  categoryKey: string,
): ScatterPoint {
  const rawZ = point[zAxisKey] ?? point.z;
  const hasZ = rawZ !== undefined && rawZ !== null && rawZ !== "";
  const categoryRaw = point[categoryKey] ?? point.category;

  return {
    ...point,
    x: toFiniteNumber(point[xAxisKey] ?? point.x, 0),
    y: toFiniteNumber(point[yAxisKey] ?? point.y, 0),
    z: hasZ ? toFiniteNumber(rawZ, 0) : undefined,
    name: String(point[nameKey] ?? point.name ?? ""),
    category: categoryRaw ? String(categoryRaw) : undefined,
  };
}

export function useScatterMetric(props: ScatterMetricChartProps) {
  const t = useTranslations("chart");
  const defaultCategoryLabel = t("scatter_default_category");
  const defaultSeriesLabel = t("scatter_default_series");

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

  let resolvedSeries: ScatterSeries[] = [];
  if (propSeries && propSeries.length > 0) {
    resolvedSeries = propSeries.map((s, idx) => ({
      ...s,
      data: s.data.map((point) => normalizeScatterPoint(point, xAxisKey, yAxisKey, zAxisKey, nameKey, categoryKey)),
      fill: s.fill || CHART_PALETTE[idx % CHART_PALETTE.length],
    }));
  } else if (data && data.length > 0) {
    const normalizedPoints: ScatterPoint[] = data.map((point) =>
      normalizeScatterPoint(point, xAxisKey, yAxisKey, zAxisKey, nameKey, categoryKey),
    );

    // Group by category if present
    const hasCategories = normalizedPoints.some((d) => Boolean(d.category));
    if (hasCategories) {
      const map = new Map<string, typeof normalizedPoints>();
      for (const point of normalizedPoints) {
        const cat = point.category || defaultCategoryLabel;
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(point);
      }

      resolvedSeries = Array.from(map.entries()).map(([cat, points], idx) => ({
        name: cat,
        data: points,
        fill: CHART_PALETTE[idx % CHART_PALETTE.length],
      }));
    } else {
      resolvedSeries = [
        {
          name: defaultSeriesLabel,
          data: normalizedPoints,
          fill: "var(--primary)",
        },
      ];
    }
  }

  const { valueFormatter: baseFormatter } = useChartFormatters();
  const xFormatter = useMemoizedFn((val: number) => (customXFormatter ?? xValueFormatter ?? baseFormatter)(val));
  const yFormatter = useMemoizedFn((val: number) => (customYFormatter ?? yValueFormatter ?? baseFormatter)(val));
  const zFormatter = useMemoizedFn((val: number) => (customZFormatter ?? zValueFormatter ?? baseFormatter)(val));

  return {
    resolvedSeries,
    xFormatter,
    yFormatter,
    zFormatter,
  };
}
