import type { ExpressionSpecification } from "maplibre-gl";

export interface ChoroplethLegendStep {
  color: string;
  min: number;
  max: number;
  rangeText: string;
}

export interface ChoroplethComputation {
  min: number;
  max: number;
  thresholds: number[];
  legendSteps: ChoroplethLegendStep[];
  fillColorExpression: ExpressionSpecification;
}

function snapThreshold(value: number, span: number): number {
  if (span >= 50) return Math.round(value);
  if (span >= 5) return Number(value.toFixed(1));
  if (span >= 0.5) return Number(value.toFixed(2));
  return Number(value.toFixed(3));
}

function defaultFormatNum(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toString();
}

/** 将 GeoJSON 属性中的未知数值安全解析为有限数字（排除 null、空字符串、NaN 与 Infinity） */
export function parseFiniteMetricValue(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") {
    return undefined;
  }
  const num = Number(raw);
  return Number.isFinite(num) ? num : undefined;
}

/**
 * 构建支持任意数值尺度（含 [0, 1] 浮点比率）的安全分级设色步进表达式与图例。
 * MapLibre `["step", ...]` 严格要求 stop 严格单调递增，此处会显式去重/退避。
 */
export function buildChoroplethSteps(
  rawValues: readonly number[],
  colors: readonly string[],
  valueKey: string,
  unit = "",
  formatNumber: (v: number) => string = defaultFormatNum,
): ChoroplethComputation {
  const valid = rawValues.filter((v) => Number.isFinite(v));
  let minVal = valid.length > 0 ? valid.reduce((a, b) => (b < a ? b : a), valid[0]) : 0;
  let maxVal = valid.length > 0 ? valid.reduce((a, b) => (b > a ? b : a), valid[0]) : 100;

  if (minVal === maxVal) {
    maxVal = minVal === 0 ? 100 : minVal + Math.max(1, Math.abs(minVal) * 0.25);
  }

  const span = maxVal - minVal;
  const binCount = Math.max(2, colors.length);
  const rawThresholds: number[] = [];

  for (let i = 1; i < binCount; i += 1) {
    const t = snapThreshold(minVal + (span * i) / binCount, span);
    const prev = rawThresholds[rawThresholds.length - 1];
    if (prev === undefined || t > prev) {
      rawThresholds.push(t);
    }
  }

  let thresholds: number[];
  if (rawThresholds.length === binCount - 1) {
    thresholds = rawThresholds;
  } else {
    const fallbackDigits = span > 0 ? Math.min(12, Math.max(4, Math.ceil(-Math.log10(span / binCount)) + 2)) : 4;
    thresholds = [];
    for (let idx = 1; idx < binCount; idx += 1) {
      const exact = minVal + (span * idx) / binCount;
      const snapped = Number(exact.toFixed(fallbackDigits));
      const prev = thresholds[thresholds.length - 1];
      thresholds.push(prev !== undefined && snapped <= prev ? exact : snapped);
    }
  }

  const unitSuffix = unit ? ` ${unit}` : "";
  const legendSteps: ChoroplethLegendStep[] = colors.map((color, idx) => {
    if (idx === 0) {
      const upper = thresholds[0];
      return { color, min: minVal, max: upper, rangeText: `< ${formatNumber(upper)}${unitSuffix}` };
    }
    if (idx === colors.length - 1) {
      const lower = thresholds[thresholds.length - 1];
      return { color, min: lower, max: maxVal, rangeText: `≥ ${formatNumber(lower)}${unitSuffix}` };
    }
    const lower = thresholds[idx - 1];
    const upper = thresholds[idx];
    return { color, min: lower, max: upper, rangeText: `${formatNumber(lower)} - ${formatNumber(upper)}${unitSuffix}` };
  });

  const stepArgs: unknown[] = ["step", ["coalesce", ["to-number", ["get", valueKey]], 0], colors[0]];
  thresholds.forEach((th, idx) => {
    stepArgs.push(th, colors[idx + 1] ?? colors[colors.length - 1]);
  });

  return {
    min: minVal,
    max: maxVal,
    thresholds,
    legendSteps,
    fillColorExpression: stepArgs as ExpressionSpecification,
  };
}
