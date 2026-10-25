import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChartCard } from "@/components/chart/card/ChartCard";
import { renderWithProviders, screen } from "test/test-utils";

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
});
