import { describe, expect, it } from "vitest";
import React from "react";
import { act } from "@testing-library/react";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

import { StatCard } from "@/components/stats/stat-card/StatCard";
import { LiveStatCard } from "@/components/stats/live-card/LiveStatCard";
import { MultiMetricStatCard } from "@/components/stats/multi-metric-card/MultiMetricStatCard";
import { ProgressStatCard } from "@/components/stats/progress-card/ProgressStatCard";
import { StatsGrid } from "@/components/stats/grid/StatsGrid";
import { MiniSparkline } from "@/components/stats/sparkline/MiniSparkline";

describe("Stats Subsystem Components", () => {
  describe("StatCard (General Purpose)", () => {
    it("renders title, formatted value, prefix, suffix, and description", () => {
      renderWithProviders(
        <StatCard
          title="活跃用户总数"
          value={48920}
          prefix="~"
          suffix="人"
          description="过去30天内有过登录操作的独立用户"
        />,
      );

      expect(screen.getByText("活跃用户总数")).toBeInTheDocument();
      expect(screen.getByText("~")).toBeInTheDocument();
      expect(screen.getByText("人")).toBeInTheDocument();
      expect(screen.getByText("48,920")).toBeInTheDocument();
      expect(screen.getByLabelText("过去30天内有过登录操作的独立用户")).toBeInTheDocument();
    });

    it("renders upward and downward trends correctly", () => {
      const { unmount } = renderWithProviders(
        <StatCard title="周环比营收" value="$128,400" trend={{ value: "+12.4%", direction: "up", label: "较上周" }} />,
      );

      expect(screen.getByText("+12.4%")).toBeInTheDocument();
      expect(screen.getByText("较上周")).toBeInTheDocument();
      unmount();

      renderWithProviders(
        <StatCard
          title="异常流失率"
          value="4.2%"
          trend={{ value: "-1.8%", direction: "down", isPositiveGood: false, label: "环比" }}
        />,
      );

      expect(screen.getByText("-1.8%")).toBeInTheDocument();
      expect(screen.getByText("环比")).toBeInTheDocument();
    });

    it("renders skeleton loading state when isLoading is true", () => {
      renderWithProviders(<StatCard title="待加载指标" value={100} isLoading />);

      expect(screen.queryByText("100")).not.toBeInTheDocument();
    });

    it("triggers copy value successfully when copyable is true", async () => {
      renderWithProviders(<StatCard title="API 秘钥" value="sk-test-token-abcdef" copyable />);

      const copyBtn = screen.getByRole("button", { name: "复制数值" });
      expect(copyBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(copyBtn);
      });
    });

    it("wraps card inside Next.js Link when to prop is provided", () => {
      renderWithProviders(<StatCard title="查看全景看板" value={99} to="/overview" />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/overview");
      expect(screen.getByText("查看全景看板")).toBeInTheDocument();
    });
  });

  describe("LiveStatCard (Realtime Telemetry)", () => {
    it("renders live stat card with online status and pulse", () => {
      renderWithProviders(<LiveStatCard title="集群活跃连接" value={1420} status="online" pulse lastUpdated="1秒前" />);

      expect(screen.getByText("集群活跃连接")).toBeInTheDocument();
      expect(screen.getByText("运行正常")).toBeInTheDocument();
      expect(screen.getByText("1秒前")).toBeInTheDocument();
    });

    it("renders warning status with custom text", () => {
      renderWithProviders(<LiveStatCard title="CPU 核心温度" value="82°C" status="warning" statusText="温度过高" />);

      expect(screen.getByText("CPU 核心温度")).toBeInTheDocument();
      expect(screen.getByText("温度过高")).toBeInTheDocument();
    });
  });

  describe("MultiMetricStatCard (Composite Metric Breakdown)", () => {
    it("renders primary metric along with secondary sub-metrics", () => {
      renderWithProviders(
        <MultiMetricStatCard
          title="云主机吞吐量"
          primaryLabel="总带宽"
          primaryValue="1.28 Gbps"
          primaryTrend={{ value: "+8.5%", direction: "up" }}
          metrics={[
            { label: "下行带宽", value: "980 Mbps", trend: { value: "+12%" } },
            { label: "上行带宽", value: "300 Mbps", trend: { value: "-3%" } },
          ]}
        />,
      );

      expect(screen.getByText("云主机吞吐量")).toBeInTheDocument();
      expect(screen.getByText("总带宽")).toBeInTheDocument();
      expect(screen.getByText("1.28 Gbps")).toBeInTheDocument();
      expect(screen.getByText("+8.5%")).toBeInTheDocument();
      expect(screen.getByText("下行带宽")).toBeInTheDocument();
      expect(screen.getByText("980 Mbps")).toBeInTheDocument();
      expect(screen.getByText("上行带宽")).toBeInTheDocument();
      expect(screen.getByText("300 Mbps")).toBeInTheDocument();
    });
  });

  describe("ProgressStatCard (Goals & Pacing)", () => {
    it("renders progress stat card with target and percentage", () => {
      renderWithProviders(
        <ProgressStatCard title="年度销售配额" value={750000} targetValue={1000000} pacingStatus="on_track" />,
      );

      expect(screen.getByText("年度销售配额")).toBeInTheDocument();
      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByText("稳步推进")).toBeInTheDocument();
      expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
    });
  });

  describe("StatsGrid (Layout Container)", () => {
    it("renders children in a grid container", () => {
      renderWithProviders(
        <StatsGrid columns={3}>
          <StatCard title="Card 1" value={1} />
          <StatCard title="Card 2" value={2} />
          <StatCard title="Card 3" value={3} />
        </StatsGrid>,
      );

      expect(screen.getByText("Card 1")).toBeInTheDocument();
      expect(screen.getByText("Card 2")).toBeInTheDocument();
      expect(screen.getByText("Card 3")).toBeInTheDocument();
    });

    it("renders skeleton placeholders when isLoading is true", () => {
      renderWithProviders(
        <StatsGrid columns={4} isLoading skeletonCount={4}>
          <StatCard title="Hidden 1" value={1} />
        </StatsGrid>,
      );

      expect(screen.queryByText("Hidden 1")).not.toBeInTheDocument();
    });
  });

  describe("MiniSparkline (SVG Paths)", () => {
    it("renders sparkline svg with area fill gradient", () => {
      const { container } = renderWithProviders(
        <MiniSparkline data={[10, 20, 15, 30, 45, 25]} type="area" width={120} height={36} />,
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 120 36");
      expect(container.querySelector("path")).toBeInTheDocument();
    });

    it("renders sparkline bars when type is bar", () => {
      const { container } = renderWithProviders(
        <MiniSparkline data={[5, 12, 18, 9, 24]} type="bar" width={100} height={30} />,
      );

      const rects = container.querySelectorAll("rect");
      expect(rects.length).toBe(5);
    });
  });
});
