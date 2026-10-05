import { useMemo } from "react";

import type { HeatmapCell } from "./types";

interface UseHeatmapMatrixOptions {
  data: HeatmapCell[];
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  xLabels?: (string | number)[];
  yLabels?: string[];
}

export interface ComputedHeatmapCell {
  x: string | number;
  y: string;
  value: number;
  ratio: number;
  level: number; // 0 to 4
  raw?: HeatmapCell;
}

export interface ComputedHeatmapRow {
  y: string;
  cells: ComputedHeatmapCell[];
}

export function useHeatmapMatrix({
  data,
  xKey = "x",
  yKey = "y",
  valueKey = "value",
  xLabels,
  yLabels,
}: UseHeatmapMatrixOptions) {
  return useMemo(() => {
    const getX = (item: any): string | number => item[xKey] ?? item.x ?? "";
    const getY = (item: any): string => String(item[yKey] ?? item.y ?? "");
    const getValue = (item: any): number => Number(item[valueKey] ?? item.value ?? 0);

    const computedXLabels =
      xLabels && xLabels.length > 0 ? xLabels : Array.from(new Set(data.map(getX)));

    const computedYLabels =
      yLabels && yLabels.length > 0 ? yLabels : Array.from(new Set(data.map(getY)));

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let total = 0;

    const cellLookup = new Map<string, HeatmapCell>();

    for (const item of data) {
      const xVal = getX(item);
      const yVal = getY(item);
      const val = getValue(item);
      const key = `${String(xVal)}__${yVal}`;
      cellLookup.set(key, { ...item, x: xVal, y: yVal, value: val });
      if (val < min) min = val;
      if (val > max) max = val;
      total += val;
    }

    if (min === Number.POSITIVE_INFINITY) {
      min = 0;
      max = 0;
    }

    const range = max - min;

    const rows: ComputedHeatmapRow[] = computedYLabels.map((y) => {
      const cells: ComputedHeatmapCell[] = computedXLabels.map((x) => {
        const key = `${String(x)}__${y}`;
        const raw = cellLookup.get(key);
        const value = raw?.value ?? 0;
        const ratio =
          range > 0 ? Math.max(0, Math.min(1, (value - min) / range)) : value > 0 ? 1 : 0;
        const level = value === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(ratio * 4)));

        return {
          x,
          y,
          value,
          ratio,
          level,
          raw,
        };
      });

      return { y, cells };
    });

    const count = data.length;
    const average = count > 0 ? total / count : 0;

    return {
      xLabels: computedXLabels,
      yLabels: computedYLabels,
      rows,
      min,
      max,
      total,
      average,
    };
  }, [data, xKey, yKey, valueKey, xLabels, yLabels]);
}
