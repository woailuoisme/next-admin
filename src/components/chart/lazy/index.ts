import type { AreaTrendChartProps } from "../area/types";
import type { BarTrendChartProps } from "../bar/types";
import type { ComposedTrendChartProps } from "../composed/types";
import type { DonutDistributionChartProps } from "../donut/types";
import type { FunnelConversionChartProps } from "../funnel/types";
import type { HeatmapMatrixChartProps } from "../heatmap/types";
import type { HorizontalBarChartProps } from "../horizontal-bar/types";
import type { LineTrendChartProps } from "../line/types";
import type { RadarMetricChartProps } from "../radar/types";
import type { RadialGaugeChartProps } from "../radial-gauge/types";
import type { ScatterMetricChartProps } from "../scatter/types";
import type { MetricSparklineProps } from "../sparkline/types";
import type { TreemapDistributionChartProps } from "../treemap/types";
import type { WaterfallFinancialChartProps } from "../waterfall/types";

import { createLazyChart } from "./createLazyChart";

export * from "./createLazyChart";

export const LazyAreaTrendChart = createLazyChart<AreaTrendChartProps>(
  () => import("../area").then((m) => ({ default: m.AreaTrendChart })),
  { defaultHeight: 300, variant: "trend" },
);

export const LazyBarTrendChart = createLazyChart<BarTrendChartProps>(
  () => import("../bar").then((m) => ({ default: m.BarTrendChart })),
  { defaultHeight: 300, variant: "bar" },
);

export const LazyComposedTrendChart = createLazyChart<ComposedTrendChartProps>(
  () => import("../composed").then((m) => ({ default: m.ComposedTrendChart })),
  { defaultHeight: 320, variant: "trend" },
);

export const LazyDonutDistributionChart = createLazyChart<DonutDistributionChartProps>(
  () => import("../donut").then((m) => ({ default: m.DonutDistributionChart })),
  { defaultHeight: 260, variant: "donut" },
);

export const LazyHorizontalBarChart = createLazyChart<HorizontalBarChartProps>(
  () => import("../horizontal-bar").then((m) => ({ default: m.HorizontalBarChart })),
  { defaultHeight: 200, variant: "bar" },
);

export const LazyLineTrendChart = createLazyChart<LineTrendChartProps>(
  () => import("../line").then((m) => ({ default: m.LineTrendChart })),
  { defaultHeight: 300, variant: "trend" },
);

export const LazyRadarMetricChart = createLazyChart<RadarMetricChartProps>(
  () => import("../radar").then((m) => ({ default: m.RadarMetricChart })),
  { defaultHeight: 300, variant: "radar" },
);

export const LazyRadialGaugeChart = createLazyChart<RadialGaugeChartProps>(
  () => import("../radial-gauge").then((m) => ({ default: m.RadialGaugeChart })),
  { defaultHeight: 240, variant: "gauge" },
);

export const LazyFunnelConversionChart = createLazyChart<FunnelConversionChartProps>(
  () => import("../funnel").then((m) => ({ default: m.FunnelConversionChart })),
  { defaultHeight: 320, variant: "bar" },
);

export const LazyWaterfallFinancialChart = createLazyChart<WaterfallFinancialChartProps>(
  () => import("../waterfall").then((m) => ({ default: m.WaterfallFinancialChart })),
  { defaultHeight: 320, variant: "bar" },
);

export const LazyScatterMetricChart = createLazyChart<ScatterMetricChartProps>(
  () => import("../scatter").then((m) => ({ default: m.ScatterMetricChart })),
  { defaultHeight: 320, variant: "trend" },
);

export const LazyHeatmapMatrixChart = createLazyChart<HeatmapMatrixChartProps>(
  () => import("../heatmap").then((m) => ({ default: m.HeatmapMatrixChart })),
  { defaultHeight: 260, variant: "bar" },
);

export const LazyTreemapDistributionChart = createLazyChart<TreemapDistributionChartProps>(
  () => import("../treemap").then((m) => ({ default: m.TreemapDistributionChart })),
  { defaultHeight: 300, variant: "bar" },
);

export const LazyMetricSparkline = createLazyChart<MetricSparklineProps>(
  () => import("../sparkline").then((m) => ({ default: m.MetricSparkline })),
  { defaultHeight: 32, variant: "trend" },
);
