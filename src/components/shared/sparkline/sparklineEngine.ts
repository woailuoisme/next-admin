export type SparklineInputPoint = number | { value: number; [key: string]: unknown };

export type SparklineVariant = "area" | "line" | "bar";

export type SparklineCurve = "linear" | "monotone";

export type SparklineTrend = "up" | "down" | "neutral";

export interface SparklineCoordPoint {
  x: number;
  y: number;
  value: number;
  index: number;
}

export interface SparklineBarGeometry {
  key: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

export interface SparklineGeometryInput {
  data?: readonly SparklineInputPoint[];
  variant?: SparklineVariant;
  curve?: SparklineCurve;
  width?: number;
  height?: number;
  padding?: number;
  barWidth?: number;
  barGap?: number;
}

export interface SparklineGeometryResult {
  values: number[];
  isEmpty: boolean;
  min: number;
  max: number;
  first: number;
  last: number;
  trend: SparklineTrend;
  totalWidth: number;
  linePath: string;
  areaPath: string;
  bars: SparklineBarGeometry[];
  points: SparklineCoordPoint[];
  minPoint: SparklineCoordPoint | null;
  maxPoint: SparklineCoordPoint | null;
  lastPoint: SparklineCoordPoint | null;
}

const round1 = (num: number): number => Math.round(num * 10) / 10;

const EMPTY_GEOMETRY: SparklineGeometryResult = {
  values: [],
  isEmpty: true,
  min: 0,
  max: 0,
  first: 0,
  last: 0,
  trend: "neutral",
  totalWidth: 0,
  linePath: "",
  areaPath: "",
  bars: [],
  points: [],
  minPoint: null,
  maxPoint: null,
  lastPoint: null,
};

function toFinitePointValue(item: SparklineInputPoint): number | null {
  const raw: unknown = typeof item === "number" ? item : item?.value;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

/**
 * Checks whether a sparkline series contains at least one finite numeric value.
 */
export function hasFiniteSparklinePoints(data?: readonly SparklineInputPoint[]): boolean {
  if (!data || data.length === 0) {
    return false;
  }
  for (let i = 0; i < data.length; i++) {
    if (toFinitePointValue(data[i]) !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Pure SVG sparkline geometry engine shared across KPI stat cards and chart widgets.
 * Filters non-finite values, performs a single-pass min/max scan, and outputs
 * 1-decimal SVG coordinates with single-point baseline safety.
 */
export function computeSparklineGeometry({
  data,
  variant = "area",
  curve = "monotone",
  width = 100,
  height = 32,
  padding = 2,
  barWidth: explicitBarWidth,
  barGap: explicitBarGap,
}: SparklineGeometryInput): SparklineGeometryResult {
  if (!data || data.length === 0) {
    return EMPTY_GEOMETRY;
  }

  const values: number[] = [];
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let minIndex = 0;
  let maxIndex = 0;

  for (let i = 0; i < data.length; i++) {
    const val = toFinitePointValue(data[i]);
    if (val === null) continue;
    const idx = values.length;
    values.push(val);
    if (val < min) {
      min = val;
      minIndex = idx;
    }
    if (val > max) {
      max = val;
      maxIndex = idx;
    }
  }

  if (values.length === 0) {
    return EMPTY_GEOMETRY;
  }

  const first = values[0];
  const last = values[values.length - 1];
  const trend: SparklineTrend = last > first ? "up" : last < first ? "down" : "neutral";
  const range = max > min ? max - min : 1;
  const effectiveHeight = Math.max(1, height - padding * 2);
  const drawWidth = Math.max(1, width - padding * 2);

  const points: SparklineCoordPoint[] = values.map((val, idx) => {
    const x = values.length > 1 ? round1((idx / (values.length - 1)) * drawWidth + padding) : round1(width / 2);
    const normalizedY = max > min ? (val - min) / range : 0.5;
    const y = round1(height - padding - normalizedY * effectiveHeight);
    return { x, y, value: val, index: idx };
  });

  const minPoint = points[minIndex] ?? null;
  const maxPoint = points[maxIndex] ?? null;
  const lastPoint = points[points.length - 1] ?? null;

  if (variant === "bar") {
    const useFixedBarLayout = explicitBarWidth !== undefined || explicitBarGap !== undefined;
    const fixedBarW = explicitBarWidth ?? 4;
    const fixedGap = explicitBarGap ?? 2;
    const resolvedBarWidth = useFixedBarLayout ? fixedBarW : Math.max(2, round1((width / values.length) * 0.65));
    const step = useFixedBarLayout ? fixedBarW + fixedGap : width / values.length;
    const totalWidth = useFixedBarLayout ? Math.max(width, values.length * step - fixedGap) : width;

    const bars: SparklineBarGeometry[] = values.map((val, idx) => {
      const ratio = max > min ? (val - min) / range : 0.5;
      const barH = Math.max(useFixedBarLayout ? 2 : 3, round1(ratio * effectiveHeight));
      const x = useFixedBarLayout ? idx * step : round1(idx * step + (step - resolvedBarWidth) / 2);
      const y = round1(height - padding - barH);
      const isLast = idx === values.length - 1;

      return {
        key: idx,
        x,
        y,
        width: resolvedBarWidth,
        height: barH,
        opacity: isLast ? 1 : 0.65,
      };
    });

    return {
      values,
      isEmpty: false,
      min,
      max,
      first,
      last,
      trend,
      totalWidth,
      linePath: "",
      areaPath: "",
      bars,
      points,
      minPoint,
      maxPoint,
      lastPoint,
    };
  }

  let linePath = "";
  if (points.length === 1) {
    linePath = `M 0 ${points[0].y} L ${round1(width)} ${points[0].y}`;
  } else if (curve === "linear" || points.length === 2) {
    const segs = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 1; i < points.length; i++) {
      segs.push(`L ${points[i].x} ${points[i].y}`);
    }
    linePath = segs.join(" ");
  } else {
    const segs = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = round1((p0.x + p1.x) / 2);
      segs.push(`C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`);
    }
    linePath = segs.join(" ");
  }

  const areaPath =
    variant === "area" && points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${round1(height)} L ${points[0].x} ${round1(height)} Z`
      : "";

  return {
    values,
    isEmpty: false,
    min,
    max,
    first,
    last,
    trend,
    totalWidth: width,
    linePath,
    areaPath,
    bars: [],
    points,
    minPoint,
    maxPoint,
    lastPoint,
  };
}
