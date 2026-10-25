import { describe, expect, it } from "vitest";

import { HeatmapMatrixChart } from "@/components/chart/heatmap/HeatmapMatrixChart";
import { HorizontalBarChart } from "@/components/chart/horizontal-bar/HorizontalBarChart";
import { RadialGaugeChart } from "@/components/chart/radial-gauge/RadialGaugeChart";
import { ChartSkeleton } from "@/components/chart/shared/ChartSkeleton";
import { MetricSparkline } from "@/components/chart/sparkline/MetricSparkline";
import { renderWithProviders, screen } from "test/test-utils";

describe("Chart Components", () => {
  it("renders HorizontalBarChart with ranks and percentage", () => {
    const data = [
      { label: "Chrome", value: 6500 },
      { label: "Safari", value: 2000 },
      { label: "Firefox", value: 1000 },
    ];

    renderWithProviders(<HorizontalBarChart data={data} showPercentage />);

    expect(screen.getByText("Chrome")).toBeInTheDocument();
    expect(screen.getByText("Safari")).toBeInTheDocument();
    expect(screen.getByText("Firefox")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders RadialGaugeChart with default label and value", () => {
    renderWithProviders(<RadialGaugeChart value={75} max={100} unit="%" />);

    expect(screen.getByText("达成率")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("renders MetricSparkline with valid SVG paths and accessible label", () => {
    renderWithProviders(<MetricSparkline data={[10, 20, 15, 30, 45]} width={120} height={36} />);

    const sparkline = screen.getByRole("img");
    expect(sparkline).toBeInTheDocument();
    expect(sparkline.getAttribute("aria-label")).toContain("走势微图");
  });

  it("renders HeatmapMatrixChart matrix cells and legend", () => {
    const data = [
      { day: "Mon", hour: "09:00", count: 12 },
      { day: "Tue", hour: "09:00", count: 25 },
    ];

    renderWithProviders(
      <HeatmapMatrixChart data={data} xKey="hour" yKey="day" valueKey="count" legendTitle="访问频次" />,
    );

    expect(screen.getByRole("img", { name: /Heatmap matrix showing 访问频次/i })).toBeInTheDocument();
  });

  it("renders ChartSkeleton variants correctly", () => {
    const { rerender } = renderWithProviders(<ChartSkeleton variant="donut" height={200} />);
    expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("data-variant", "donut");

    rerender(<ChartSkeleton variant="bar" height={200} />);
    expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("data-variant", "bar");

    rerender(<ChartSkeleton variant="gauge" height={200} />);
    expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("data-variant", "gauge");
  });
});
