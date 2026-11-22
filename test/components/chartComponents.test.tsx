import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeatmapMatrixChart } from "@/components/chart/heatmap/HeatmapMatrixChart";
import { HorizontalBarChart } from "@/components/chart/horizontal-bar/HorizontalBarChart";
import { RadialGaugeChart } from "@/components/chart/radial-gauge/RadialGaugeChart";
import { ChartEmptyState } from "@/components/chart/shared/ChartEmptyState";
import { ChartSkeleton } from "@/components/chart/shared/ChartSkeleton";
import { MetricSparkline } from "@/components/chart/sparkline/MetricSparkline";
import { renderWithProviders, screen } from "test/test-utils";

describe("Chart Components", () => {
	it("renders HorizontalBarChart with ranks, percentage, and accessible progressbars", () => {
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
		expect(screen.getAllByRole("progressbar")).toHaveLength(3);
	});

	it("renders zero-width track indicator when HorizontalBarChart item value is 0", () => {
		const data = [
			{ label: "Active", value: 100 },
			{ label: "Inactive", value: 0 },
		];

		renderWithProviders(<HorizontalBarChart data={data} />);

		const bars = screen.getAllByRole("progressbar");
		expect(bars).toHaveLength(2);
		expect(bars[1]).toHaveAttribute("aria-valuenow", "0");
		expect(bars[1].firstElementChild).toHaveStyle({ width: "0%" });
	});

	it("renders RadialGaugeChart with meter role and guards non-finite values", () => {
		const { rerender } = renderWithProviders(<RadialGaugeChart value={75} min={0} max={100} unit="%" />);

		const meter = screen.getByRole("meter", { name: /达成率|achievement/i });
		expect(meter).toHaveAttribute("aria-valuenow", "75");
		expect(meter).toHaveAttribute("aria-valuemin", "0");
		expect(meter).toHaveAttribute("aria-valuemax", "100");
		expect(screen.getByText("75")).toBeInTheDocument();

		rerender(<RadialGaugeChart value={Number.NaN} min={Number.NaN} max={100} unit="%" height="20rem" />);
		const updatedMeter = screen.getByRole("meter");
		expect(updatedMeter).toHaveAttribute("aria-valuenow", "0");
		expect(updatedMeter).toHaveAttribute("aria-valuemin", "0");
		expect(updatedMeter.style.height).toBe("20rem");
		expect(screen.queryByText("NaN%")).not.toBeInTheDocument();

		rerender(<RadialGaugeChart value={64} min={0} max={100} unit="%" subtext="CPU" height={80} />);
		expect(screen.queryByText("CPU")).not.toBeInTheDocument();
		expect(screen.queryByText("100%")).not.toBeInTheDocument();
	});

	it("renders MetricSparkline with valid SVG paths, sanitized gradId, single-point resilience, and chart-2 positive color", () => {
		const { container, rerender } = renderWithProviders(
			<MetricSparkline data={[10, 20, 15, 30, 45]} width={120} height={36} trendColor />,
		);

		const sparkline = screen.getByRole("img");
		expect(sparkline).toBeInTheDocument();
		expect(sparkline.getAttribute("aria-label")).toMatch(/走势微图|Sparkline/i);
		const grad = container.querySelector("linearGradient");
		expect(grad).not.toBeNull();
		expect(grad?.getAttribute("id")).not.toContain(":");
		const strokePath = container.querySelector('path[fill="none"]');
		expect(strokePath).toHaveAttribute("stroke", "var(--chart-2)");

		rerender(<MetricSparkline data={[Number.NaN, 42]} width={120} height={36} />);
		expect(screen.getByRole("img")).toHaveAttribute("aria-label", expect.stringMatching(/42/));
		expect(container.querySelector("path")).not.toBeNull();
		expect(container.querySelector("defs")).toBeNull();
	});

	it("renders HeatmapMatrixChart matrix cells, axis labels, and supports keyboard focus tooltips", () => {
		const data = [
			{ day: "Mon", hour: "09:00", count: 12 },
			{ day: "Tue", hour: "09:00", count: 25 },
		];

		renderWithProviders(
			<HeatmapMatrixChart
				data={data}
				xKey="hour"
				yKey="day"
				valueKey="count"
				xLabel="Hour"
				yLabel="Day"
				colorTheme="chart-4"
				legendTitle="访问频次"
				height="320px"
			/>,
		);

		expect(
			screen.getByRole("grid", { name: /(展示 访问频次 的热力矩阵|Heatmap matrix showing 访问频次)/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Hour")).toBeInTheDocument();
		expect(screen.getByText("Day")).toBeInTheDocument();

		const firstCell = screen.getByRole("gridcell", { name: "Mon 09:00: 12" });
		const secondCell = screen.getByRole("gridcell", { name: "Tue 09:00: 25" });
		expect(firstCell).toHaveAttribute("tabindex", "0");
		expect(secondCell).toHaveAttribute("tabindex", "-1");

		fireEvent.focus(firstCell);
		const tooltipHeading = screen.getByText("Mon · 09:00");
		expect(tooltipHeading).toBeInTheDocument();
		const tooltipSurface = tooltipHeading.closest("div.absolute");
		expect(tooltipSurface).not.toBeNull();

		fireEvent.keyDown(firstCell, { key: "ArrowDown" });
		expect(firstCell).toHaveAttribute("tabindex", "-1");
		expect(secondCell).toHaveAttribute("tabindex", "0");

		fireEvent.keyDown(secondCell, { key: "Escape" });
		expect(screen.queryByText("Mon · 09:00")).not.toBeInTheDocument();
	});

	it("renders ChartSkeleton variants and ChartEmptyState with accessible status roles", () => {
		const { rerender } = renderWithProviders(<ChartSkeleton variant="donut" height={200} />);
		expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("data-variant", "donut");
		expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("role", "status");

		rerender(<ChartSkeleton variant="bar" height={200} />);
		expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("data-variant", "bar");

		rerender(<ChartSkeleton variant="gauge" height={200} />);
		expect(screen.getByTestId("chart-skeleton")).toHaveAttribute("data-variant", "gauge");

		rerender(<ChartEmptyState height={180} />);
		expect(screen.getByRole("status")).toBeInTheDocument();
	});
});
