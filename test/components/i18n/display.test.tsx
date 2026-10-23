import { describe, expect, it, vi } from "vitest";

import { ChartEmptyState } from "@/components/chart/shared/ChartEmptyState";
import { InfolistCallout } from "@/components/infolist/callout/InfolistCallout";
import { MapEmptyState } from "@/components/map/shared/MapEmptyState";
import { LiveStatCard } from "@/components/stats/live-card/LiveStatCard";
import { StatCardProgress } from "@/components/stats/primitives/StatCardProgress";
import { StatCardValue } from "@/components/stats/primitives/StatCardValue";
import { renderWithProviders, screen } from "test/test-utils";

describe("Display components i18n", () => {
  it("localizes the map empty state", () => {
    const zh = renderWithProviders(<MapEmptyState />);
    expect(screen.getByText("暂无地理坐标数据")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<MapEmptyState />, { locale: "en" });
    expect(screen.getByText("No coordinate data")).toBeInTheDocument();
  });

  it("localizes the chart empty state", () => {
    const zh = renderWithProviders(<ChartEmptyState />);
    expect(screen.getByText("暂无统计数据")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<ChartEmptyState />, { locale: "en" });
    expect(screen.getByText("No chart data available")).toBeInTheDocument();
  });

  it("localizes the infolist callout close button", () => {
    const zh = renderWithProviders(
      <InfolistCallout dismissible onDismiss={vi.fn()}>
        提示内容
      </InfolistCallout>,
    );
    expect(screen.getByRole("button", { name: "关闭提示" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(
      <InfolistCallout dismissible onDismiss={vi.fn()}>
        Alert Message
      </InfolistCallout>,
      { locale: "en" },
    );
    expect(screen.getByRole("button", { name: "Close alert" })).toBeInTheDocument();
  });

  it("localizes live stat card status and live label", () => {
    const zh = renderWithProviders(<LiveStatCard title="服务器QPS" value={1250} status="online" />);
    expect(screen.getByText("运行正常")).toBeInTheDocument();
    expect(screen.getByText("实时更新中")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<LiveStatCard title="Server QPS" value={1250} status="online" />, { locale: "en" });
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("Live Updating")).toBeInTheDocument();
  });

  it("localizes stat card pacing labels", () => {
    const zh = renderWithProviders(<StatCardProgress value={80} targetValue={100} pacingStatus="on_track" />);
    expect(screen.getByText("稳步推进")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<StatCardProgress value={80} targetValue={100} pacingStatus="on_track" />, { locale: "en" });
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("localizes the stat card copy action", () => {
    const zh = renderWithProviders(<StatCardValue value={999} copyable />);
    expect(screen.getByRole("button", { name: "复制数值" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<StatCardValue value={999} copyable />, { locale: "en" });
    expect(screen.getByRole("button", { name: "Copy value" })).toBeInTheDocument();
  });
});
