import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChartCard } from "@/components/chart/card/ChartCard";
import { HorizontalBarChart } from "@/components/chart/horizontal-bar";
import { useChartHeight } from "@/components/chart/shared/ChartContext";
import { renderWithProviders, screen } from "test/test-utils";

function HeightProbe({ explicitHeight }: { explicitHeight?: number }) {
	const height = useChartHeight(explicitHeight, 300);
	return <div data-testid="height-probe">{height}</div>;
}

describe("ChartCard", () => {
	it("renders title, description, and children", () => {
		renderWithProviders(
			<ChartCard title="Revenue Growth" description="Monthly breakdown">
				<div data-testid="chart-content">Chart Visuals</div>
			</ChartCard>,
		);

		expect(screen.getByText("Revenue Growth")).toBeInTheDocument();
		expect(screen.getByText("Monthly breakdown")).toBeInTheDocument();
		expect(screen.getByTestId("chart-content")).toBeInTheDocument();
	});

	it("renders empty state message when isEmpty is true", () => {
		renderWithProviders(
			<ChartCard title="Revenue Growth" isEmpty emptyMessage="No data recorded for this period">
				<div>Chart Content</div>
			</ChartCard>,
		);

		expect(screen.getByText("No data recorded for this period")).toBeInTheDocument();
		expect(screen.queryByText("Chart Content")).not.toBeInTheDocument();
	});

	it("renders error message and triggers onRetry when provided", () => {
		const handleRetry = vi.fn();

		renderWithProviders(
			<ChartCard title="Revenue Growth" errorMessage="Failed to load telemetry" onRetry={handleRetry}>
				<div>Chart Content</div>
			</ChartCard>,
		);

		expect(screen.getByText("Failed to load telemetry")).toBeInTheDocument();
		const retryBtn = screen.getByRole("button", { name: /重试|retry/i });
		fireEvent.click(retryBtn);
		expect(handleRetry).toHaveBeenCalled();
	});

	it("displays fullscreen button when showFullscreen is true", () => {
		renderWithProviders(
			<ChartCard title="Expandable Chart" showFullscreen>
				<div>Visual Content</div>
			</ChartCard>,
		);

		const fullscreenBtn = screen.getByRole("button", { name: /全屏|fullscreen/i });
		expect(fullscreenBtn).toBeInTheDocument();
	});

	it("renders matching skeletonVariant with status semantics when loading", () => {
		renderWithProviders(
			<ChartCard title="Loading Chart" isLoading skeletonVariant="donut" height={260}>
				<div>Visual Content</div>
			</ChartCard>,
		);

		const skeleton = screen.getByTestId("chart-skeleton");
		expect(skeleton).toHaveAttribute("data-variant", "donut");
		expect(skeleton).toHaveAttribute("role", "status");
		expect(skeleton).toHaveAttribute("aria-busy", "true");
	});

	it("propagates card height and overrides explicit child height in fullscreen dialog", async () => {
		renderWithProviders(
			<ChartCard title="Contextual Chart" height={340} fullscreenHeight={620} showFullscreen>
				<HeightProbe explicitHeight={280} />
			</ChartCard>,
		);

		expect(screen.getByTestId("height-probe")).toHaveTextContent("280");

		fireEvent.click(screen.getByRole("button", { name: /全屏|fullscreen/i }));

		await waitFor(() => {
			const dialog = screen.getByRole("dialog");
			expect(dialog).toHaveTextContent("620");
		});
	});

	it("inherits ChartCard height when child omits height prop", () => {
		renderWithProviders(
			<ChartCard title="Inherited Height" height={360}>
				<HeightProbe />
			</ChartCard>,
		);

		expect(screen.getByTestId("height-probe")).toHaveTextContent("360");
	});

	it("renders period selector pills and triggers onPeriodChange", () => {
		const handlePeriodChange = vi.fn();

		renderWithProviders(
			<ChartCard
				title="Period Switcher"
				periods={[
					{ label: "7D", value: "7d" },
					{ label: "30D", value: "30d" },
				]}
				activePeriod="7d"
				onPeriodChange={handlePeriodChange}
			>
				<div>Chart Body</div>
			</ChartCard>,
		);

		fireEvent.mouseDown(screen.getByRole("tab", { name: "30D" }));
		expect(handlePeriodChange).toHaveBeenCalledWith("30d");
	});

	it("overrides explicit HorizontalBarChart height in fullscreen dialog", async () => {
		renderWithProviders(
			<ChartCard title="Fullscreen Horizontal Bar" height={240} fullscreenHeight={540} showFullscreen>
				<HorizontalBarChart data={[{ label: "Chrome", value: 80 }]} height={180} />
			</ChartCard>,
		);

		fireEvent.click(screen.getByRole("button", { name: /全屏|fullscreen/i }));

		await waitFor(() => {
			const dialog = screen.getByRole("dialog");
			const chartContainer = dialog.querySelector("[style*='min-height']");
			expect(chartContainer).toHaveStyle({ minHeight: "540px" });
		});
	});
});
