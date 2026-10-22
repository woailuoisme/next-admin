import { maxBy, minBy } from "es-toolkit";
import { useMemo } from "react";

import type { SparklinePoint, SparklineType } from "./types";

interface UseSparklinePathOptions {
  data: readonly (number | SparklinePoint)[];
  type?: SparklineType;
  width?: number;
  height?: number;
  padding?: number;
}

export interface BarGeometry {
  key: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

export interface SparklinePathResult {
  values: number[];
  isEmpty: boolean;
  min: number;
  max: number;
  linePath: string;
  areaPath: string;
  bars: BarGeometry[];
}

const EMPTY_SPARKLINE_RESULT: SparklinePathResult = {
  values: [],
  isEmpty: true,
  min: 0,
  max: 0,
  linePath: "",
  areaPath: "",
  bars: [],
};

function round(val: number): number {
  return Math.round(val * 10) / 10;
}

export function useSparklinePath({
  data,
  type = "area",
  width = 100,
  height = 32,
  padding = 2,
}: UseSparklinePathOptions): SparklinePathResult {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return EMPTY_SPARKLINE_RESULT;
    }

    const values = data.map((item) => (typeof item === "number" ? item : item.value));

    const min = minBy(values, (x) => x) ?? 0;
    const max = maxBy(values, (x) => x) ?? 0;
    const range = max - min || 1;
    const availableHeight = height - padding * 2;

    if (type === "bar") {
      const barWidth = Math.max(2, round((width / values.length) * 0.65));
      const step = width / values.length;

      const bars: BarGeometry[] = values.map((val, idx) => {
        const barH = Math.max(3, round(((val - min) / range) * availableHeight));
        const x = round(idx * step + (step - barWidth) / 2);
        const y = round(height - padding - barH);
        const isLast = idx === values.length - 1;

        return {
          key: idx,
          x,
          y,
          width: barWidth,
          height: barH,
          opacity: isLast ? 1 : 0.65,
        };
      });

      return {
        values,
        isEmpty: false,
        min,
        max,
        linePath: "",
        areaPath: "",
        bars,
      };
    }

    // Area path with smooth cubic Bezier curve
    const denominator = values.length - 1 || 1;
    const points = values.map((val, idx) => {
      const x = round((idx / denominator) * (width - padding * 2) + padding);
      const y = round(height - padding - ((val - min) / range) * availableHeight);
      return { x, y };
    });

    const pathSegments: string[] = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = round((prev.x + curr.x) / 2);
      pathSegments.push(`C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`);
    }
    const linePath = pathSegments.join(" ");

    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const areaPath = `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;

    return {
      values,
      isEmpty: false,
      min,
      max,
      linePath,
      areaPath,
      bars: [],
    };
  }, [data, type, width, height, padding]);
}
