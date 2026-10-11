import type { ExpressionSpecification } from "maplibre-gl";

import { useMemo } from "react";

import type { ChoroplethColorScheme, GeoDistributionMapProps } from "./types";

import { MAP_PRIMARY_RAMP } from "../shared/constants";

/**
 * 5 级顺序色阶（浅 → 深）
 *
 * 必须使用具体色值：MapLibre 无法解析 `var()` / `oklch()` / `color-mix()`，
 * 原先 `hsl(var(--primary) / 0.15)` 会被整条丢弃，导致填充与图例色块全透明。
 */
const COLOR_RAMPS: Record<ChoroplethColorScheme, readonly string[]> = {
  primary: MAP_PRIMARY_RAMP,
  emerald: ["#ecfdf5", "#a7f3d0", "#34d399", "#059669", "#047857"],
  amber: ["#fffbeb", "#fde68a", "#fbbf24", "#d97706", "#b45309"],
  rose: ["#fff1f2", "#fecdd3", "#fb7185", "#e11d48", "#be123c"],
  violet: ["#f5f3ff", "#ddd6fe", "#a78bfa", "#7c3aed", "#5b21b6"],
};

export type LegendStep = {
  color: string;
  minLabel: string;
  maxLabel: string;
  rangeText: string;
};

export function useGeoDistribution({
  data,
  valueKey = "value",
  colorScheme = "primary",
  unit = "",
}: Pick<GeoDistributionMapProps, "data" | "valueKey" | "colorScheme" | "unit">) {
  const colors = COLOR_RAMPS[colorScheme] ?? COLOR_RAMPS.primary;

  const { min, max, thresholds, legendSteps } = useMemo(() => {
    let minVal = 0;
    let maxVal = 100;

    if (typeof data === "object" && data && "type" in data && data.type === "FeatureCollection") {
      const fc = data as GeoJSON.FeatureCollection;
      const values = fc.features.map((f) => Number(f.properties?.[valueKey])).filter((v) => !Number.isNaN(v));

      if (values.length > 0) {
        minVal = values.reduce((m, v) => (v < m ? v : m), values[0]);
        maxVal = values.reduce((m, v) => (v > m ? v : m), values[0]);
      }
    }

    if (minVal === maxVal) {
      maxVal = minVal + 100;
    }

    const span = maxVal - minVal;
    const t0 = Math.round(minVal + span * 0.2);
    const t1 = Math.round(minVal + span * 0.4);
    const t2 = Math.round(minVal + span * 0.6);
    const t3 = Math.round(minVal + span * 0.8);
    const ths = [t0, t1, t2, t3];

    const steps: LegendStep[] = [
      {
        color: colors[0],
        minLabel: `${minVal}`,
        maxLabel: `${t0}`,
        rangeText: `< ${t0}${unit ? ` ${unit}` : ""}`,
      },
      {
        color: colors[1],
        minLabel: `${t0}`,
        maxLabel: `${t1}`,
        rangeText: `${t0} - ${t1}${unit ? ` ${unit}` : ""}`,
      },
      {
        color: colors[2],
        minLabel: `${t1}`,
        maxLabel: `${t2}`,
        rangeText: `${t1} - ${t2}${unit ? ` ${unit}` : ""}`,
      },
      {
        color: colors[3],
        minLabel: `${t2}`,
        maxLabel: `${t3}`,
        rangeText: `${t2} - ${t3}${unit ? ` ${unit}` : ""}`,
      },
      {
        color: colors[4],
        minLabel: `${t3}`,
        maxLabel: `${maxVal}`,
        rangeText: `≥ ${t3}${unit ? ` ${unit}` : ""}`,
      },
    ];

    return { min: minVal, max: maxVal, thresholds: ths, legendSteps: steps };
  }, [data, valueKey, colors, unit]);

  const fillColorExpression = useMemo<ExpressionSpecification>(() => {
    // MapLibre step expression for quantized fill color
    return [
      "step",
      ["get", valueKey],
      colors[0],
      thresholds[0],
      colors[1],
      thresholds[1],
      colors[2],
      thresholds[2],
      colors[3],
      thresholds[3],
      colors[4],
    ] as ExpressionSpecification;
  }, [valueKey, colors, thresholds]);

  return {
    colors,
    min,
    max,
    thresholds,
    legendSteps,
    fillColorExpression,
  };
}
