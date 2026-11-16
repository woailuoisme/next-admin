import { renderHook, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AreaTrendChart } from "@/components/chart/area";
import { BarTrendChart } from "@/components/chart/bar";
import { ComposedTrendChart } from "@/components/chart/composed";
import { DonutDistributionChart } from "@/components/chart/donut";
import { useDonutDistribution } from "@/components/chart/donut/useDonutDistribution";
import { FunnelConversionChart } from "@/components/chart/funnel";
import { useFunnelConversion } from "@/components/chart/funnel/useFunnelConversion";
import { useHeatmapMatrix } from "@/components/chart/heatmap/useHeatmapMatrix";
import { useChartAnimation } from "@/components/chart/hooks/useChartAnimation";
import { LazyAreaTrendChart } from "@/components/chart/lazy";
import { LineTrendChart } from "@/components/chart/line";
import { RadarMetricChart } from "@/components/chart/radar";
import { useRadialGauge } from "@/components/chart/radial-gauge/useRadialGauge";
import { ScatterMetricChart } from "@/components/chart/scatter";
import { getSecondaryChartStroke } from "@/components/chart/shared/theme";
import { useMetricSparkline } from "@/components/chart/sparkline/useMetricSparkline";
import { TreemapDistributionChart } from "@/components/chart/treemap";
import { useTreemapDistribution } from "@/components/chart/treemap/useTreemapDistribution";
import { useWaterfallFinancial } from "@/components/chart/waterfall/useWaterfallFinancial";
import { WaterfallFinancialChart } from "@/components/chart/waterfall";
import zhMessages from "@/messages/zh.json";
import { renderWithProviders, screen } from "test/test-utils";

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="zh" messages={zhMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

const SAMPLE_SERIES = [
  { label: "Jan", value: 1200, secondary: 800, rate: 12.5 },
  { label: "Feb", value: 1800, secondary: 1100, rate: 15.2 },
  { label: "Mar", value: 2400, secondary: 1500, rate: 18.8 },
];

describe("Chart Calculation Engines", () => {
  it("useWaterfallFinancial handles isTotal, cross-zero ranges, and non-finite inputs", () => {
    const { result } = renderHook(
      () =>
        useWaterfallFinancial({
          data: [
            { label: "Opening", value: 100 },
            { label: "Cost", value: -150 },
            { label: "Recovery", value: 80 },
            { label: "Ending Balance", value: 30, isTotal: true },
            { label: "Corrupt", value: Number.NaN },
          ],
        }),
      { wrapper: IntlWrapper },
    );

    expect(result.current.processedData[0]).toMatchObject({
      type: "start",
      range: [0, 100],
      runningTotal: 100,
    });
    expect(result.current.processedData[1]).toMatchObject({
      type: "decrease",
      range: [-50, 100],
      runningTotal: -50,
    });
    expect(result.current.processedData[2]).toMatchObject({
      type: "increase",
      range: [-50, 30],
      runningTotal: 30,
    });
    expect(result.current.processedData[3]).toMatchObject({
      type: "total",
      range: [0, 30],
      runningTotal: 30,
    });
    expect(result.current.processedData[4].rawVal).toBe(0);
  });

  it("useFunnelConversion respects custom keys and handles 0 initial values without NaN", () => {
    const { result } = renderHook(
      () =>
        useFunnelConversion({
          data: [
            { stage: "Visit", count: 0, name: "", value: 0 },
            { stage: "Signup", count: 50, name: "", value: 0 },
          ],
          dataKey: "count",
          nameKey: "stage",
        }),
      { wrapper: IntlWrapper },
    );

    expect(result.current.processedData[0]).toMatchObject({
      name: "Visit",
      value: 0,
      conversionRate: 0,
      stepRate: 0,
      dropoffRate: 0,
    });
    expect(result.current.processedData[1]).toMatchObject({
      name: "Signup",
      value: 50,
      conversionRate: 0,
      stepRate: 0,
      dropoffRate: 0,
    });
  });

  it("useMetricSparkline filters non-finite inputs and preserves single-point 1-decimal line paths", () => {
    const { result: singleResult } = renderHook(() => useMetricSparkline({ data: [Number.NaN, 25] }));
    expect(singleResult.current.first).toBe(25);
    expect(singleResult.current.last).toBe(25);
    expect(singleResult.current.trend).toBe("neutral");
    expect(singleResult.current.linePath).toBe("M 0 16 L 100 16");
    expect(singleResult.current.areaPath).toBe("");

    const { result: emptyResult } = renderHook(() =>
      useMetricSparkline({ data: [Number.NaN, Number.POSITIVE_INFINITY] }),
    );
    expect(emptyResult.current.linePath).toBe("");
  });

  it("useRadialGauge guards NaN bounds and picks highest matched threshold", () => {
    const { result } = renderHook(() =>
      useRadialGauge({
        value: Number.NaN,
        min: 20,
        max: 100,
        thresholds: [
          { value: 50, color: "var(--chart-3)" },
          { value: 80, color: "var(--destructive)" },
        ],
      }),
    );

    expect(result.current.clampedValue).toBe(20);
    expect(Number.isFinite(result.current.strokeDashoffset)).toBe(true);
  });

  it("useHeatmapMatrix & useDonutDistribution sanitize non-finite and negative inputs", () => {
    const { result: heatmap } = renderHook(() =>
      useHeatmapMatrix({
        data: [
          { x: "09:00", y: "Mon", value: Number.NaN },
          { x: "10:00", y: "Mon", value: 40 },
        ],
      }),
    );

    expect(heatmap.current.min).toBe(0);
    expect(heatmap.current.max).toBe(40);
    expect(heatmap.current.rows[0].cells[0].value).toBe(0);

    const { result: donut } = renderHook(
      () =>
        useDonutDistribution({
          data: [
            { name: "A", value: -10 },
            { name: "B", value: 100 },
          ],
        }),
      { wrapper: IntlWrapper },
    );

    expect(donut.current.enrichedData[0].value).toBe(0);
    expect(donut.current.enrichedData[1].percentage).toBe(100);
  });

  it("getSecondaryChartStroke avoids collision when primary theme is chart-2", () => {
    expect(getSecondaryChartStroke("chart-2")).toBe("var(--chart-1)");
    expect(getSecondaryChartStroke("primary")).toBe("var(--chart-2)");
  });

  it("useTreemapDistribution recursively enriches 3-level hierarchy nodes", () => {
    const { result } = renderHook(() =>
      useTreemapDistribution({
        data: [
          {
            name: "Platform",
            children: [
              {
                name: "Compute",
                children: [
                  { name: "Edge Workers", value: 60 },
                  { name: "Queues", value: 40 },
                ],
              },
            ],
          },
        ],
      }),
    );

    expect(result.current.total).toBe(100);
    const rootNode = result.current.enrichedData[0];
    expect(rootNode.value).toBe(100);
    const branchNode = rootNode.children?.[0];
    expect(branchNode?.value).toBe(100);
    const leafNode = branchNode?.children?.[0];
    expect(leafNode?.value).toBe(60);
    expect(leafNode?.percent).toBe(60);
    expect(typeof leafNode?.color).toBe("string");
  });

  it("handles undefined data safely in treemap, heatmap, and sparkline engines", () => {
    const { result: treemap } = renderHook(() => useTreemapDistribution({ data: undefined as unknown as never[] }));
    expect(treemap.current.total).toBe(0);
    expect(treemap.current.enrichedData).toEqual([]);

    const { result: heatmap } = renderHook(() => useHeatmapMatrix({ data: undefined as unknown as never[] }));
    expect(heatmap.current.min).toBe(0);
    expect(heatmap.current.max).toBe(0);
    expect(heatmap.current.rows).toEqual([]);

    const { result: sparkline } = renderHook(() => useMetricSparkline({ data: undefined as unknown as never[] }));
    expect(sparkline.current.linePath).toBe("");
    expect(sparkline.current.trend).toBe("neutral");
  });

  it("useChartAnimation disables animations when prefers-reduced-motion matches", () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    });

    try {
      const { result: reduced } = renderHook(() => useChartAnimation(true));
      expect(reduced.current).toBe(false);

      const { result: explicitOff } = renderHook(() => useChartAnimation(false));
      expect(explicitOff.current).toBe(false);
    } finally {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });
});

describe("Recharts Visualizations Render & Lazy Smoke Tests", () => {
  it("renders all 10 Recharts components cleanly inside ChartFrame", () => {
    const { container } = renderWithProviders(
      <div>
        <AreaTrendChart
          data={SAMPLE_SERIES}
          secondaryDataKey="secondary"
          theme="chart-2"
          showBrush
          isAnimationActive={false}
          ariaLabel="Revenue area trend"
        />
        <BarTrendChart data={SAMPLE_SERIES} secondaryDataKey="secondary" isAnimationActive={false} />
        <LineTrendChart data={SAMPLE_SERIES} referenceValue={2000} showDots isAnimationActive={false} />
        <ComposedTrendChart
          data={SAMPLE_SERIES}
          bars={[{ dataKey: "value", name: "Revenue", yAxisId: "left" }]}
          lines={[{ dataKey: "rate", name: "Rate", yAxisId: "right" }]}
          xAxisFormatter={(v) => String(v).toUpperCase()}
          isAnimationActive={false}
        />
        <DonutDistributionChart
          data={[
            { name: "Cloud", value: 300 },
            { name: "Edge", value: 100 },
          ]}
          isAnimationActive={false}
          ariaLabel="Cloud vs Edge distribution"
        />
        <RadarMetricChart
          data={[
            { metric: "Security", score: 90 },
            { metric: "Speed", score: 82 },
            { metric: "Scale", score: 88 },
          ]}
          subjectKey="metric"
          series={[{ dataKey: "score", name: "Score" }]}
          isAnimationActive={false}
        />
        <FunnelConversionChart
          data={[
            { name: "Lead", value: 1000 },
            { name: "Deal", value: 200 },
          ]}
          isAnimationActive={false}
        />
        <WaterfallFinancialChart
          data={[
            { label: "Start", value: 500 },
            { label: "Loss", value: -700 },
            { label: "Net", value: -200, isTotal: true },
          ]}
          xAxisFormatter={(v) => String(v).toUpperCase()}
          showLabels
          isAnimationActive={false}
        />
        <ScatterMetricChart
          data={[
            { x: 10, y: 20, z: 5, name: "Alpha", category: "Core" },
            { x: 30, y: 40, z: 8, name: "Beta", category: "Growth" },
          ]}
          xReferenceLine={20}
          yReferenceLine={30}
          isAnimationActive={false}
        />
        <TreemapDistributionChart
          data={[
            {
              name: "Platform",
              children: [
                { name: "API", value: 60 },
                { name: "Auth", value: 40 },
              ],
            },
          ]}
          isAnimationActive={false}
        />
      </div>,
    );

    expect(container.querySelectorAll(".recharts-responsive-container").length).toBe(10);
    expect(screen.getByRole("img", { name: "Revenue area trend" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cloud vs Edge distribution" })).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
    expect(screen.getByText("Edge")).toBeInTheDocument();
    expect(screen.getByText("75.0%")).toBeInTheDocument();
  });

  it("resolves LazyAreaTrendChart dynamic wrapper asynchronously", async () => {
    const { container } = renderWithProviders(<LazyAreaTrendChart data={SAMPLE_SERIES} isAnimationActive={false} />);

    await waitFor(() => {
      expect(container.querySelector(".recharts-responsive-container")).not.toBeNull();
    });
  });
});
