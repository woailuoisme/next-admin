import { useMemo } from "react";

import type { MetricSparklinePoint } from "./types";

interface UseMetricSparklineOptions {
  data: MetricSparklinePoint[];
  curve?: "linear" | "monotone";
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  padding?: number;
}

export function useMetricSparkline({
  data,
  curve = "monotone",
  viewBoxWidth = 100,
  viewBoxHeight = 32,
  padding = 3,
}: UseMetricSparklineOptions) {
  return useMemo(() => {
    const values: number[] = data.map((item) =>
      typeof item === "number" ? item : Number(item.value) || 0,
    );

    if (values.length === 0) {
      return {
        values: [],
        points: [],
        linePath: "",
        areaPath: "",
        min: 0,
        max: 0,
        first: 0,
        last: 0,
        trend: "neutral" as const,
        minPoint: null,
        maxPoint: null,
        lastPoint: null,
      };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let minIndex = 0;
    let maxIndex = 0;

    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      if (val < min) {
        min = val;
        minIndex = i;
      }
      if (val > max) {
        max = val;
        maxIndex = i;
      }
    }

    const first = values[0];
    const last = values[values.length - 1];
    const trend: "up" | "down" | "neutral" =
      last > first ? "up" : last < first ? "down" : "neutral";

    const effectiveHeight = viewBoxHeight - padding * 2;
    const range = max > min ? max - min : 1;

    const points = values.map((val, idx) => {
      const x = values.length > 1 ? (idx / (values.length - 1)) * viewBoxWidth : viewBoxWidth / 2;
      const normalizedY = max > min ? (val - min) / range : 0.5;
      // SVG Y-coordinates are inverted (0 at top, max at bottom)
      const y = viewBoxHeight - padding - normalizedY * effectiveHeight;
      return { x, y, value: val, index: idx };
    });

    let linePath = "";
    if (points.length === 1) {
      linePath = `M 0 ${points[0].y} L ${viewBoxWidth} ${points[0].y}`;
    } else if (curve === "linear" || points.length === 2) {
      linePath = points.reduce(
        (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
        "",
      );
    } else {
      // Monotone / smooth cubic bezier
      linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        linePath += ` C ${midX.toFixed(1)} ${p0.y.toFixed(1)}, ${midX.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      }
    }

    const lastP = points[points.length - 1];
    const firstP = points[0];
    const areaPath =
      points.length > 1
        ? `${linePath} L ${lastP.x.toFixed(1)} ${viewBoxHeight} L ${firstP.x.toFixed(1)} ${viewBoxHeight} Z`
        : "";

    const minPoint = points[minIndex] ?? null;
    const maxPoint = points[maxIndex] ?? null;
    const lastPoint = points[points.length - 1] ?? null;

    return {
      values,
      points,
      linePath,
      areaPath,
      min,
      max,
      first,
      last,
      trend,
      minPoint,
      maxPoint,
      lastPoint,
    };
  }, [data, curve, viewBoxWidth, viewBoxHeight, padding]);
}
