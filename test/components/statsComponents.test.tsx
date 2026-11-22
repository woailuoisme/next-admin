import { describe, expect, it, vi } from "vitest";
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";
import zhMessages from "@/messages/zh.json";

import { StatCard } from "@/components/stats/stat-card/StatCard";
import { LiveStatCard } from "@/components/stats/live-card/LiveStatCard";
import { MultiMetricStatCard } from "@/components/stats/multi-metric-card/MultiMetricStatCard";
import { StatCardSkeleton } from "@/components/stats/primitives/StatCardSkeleton";
import { StatCardValue } from "@/components/stats/primitives";
import { ProgressStatCard } from "@/components/stats/progress-card/ProgressStatCard";
import { StatsGrid } from "@/components/stats/grid/StatsGrid";
import { MiniSparkline } from "@/components/stats/sparkline/MiniSparkline";
import { useNumberTween } from "@/components/stats/primitives/useNumberTween";
import { useDemoTelemetryTicker } from "@/features/showcase/pages/stats/hooks/useDemoTelemetryTicker";

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
			const { container } = renderWithProviders(
				<ProgressStatCard
					title="年度销售配额"
					value={750000}
					targetValue={1000000}
					pacingStatus="on_track"
					theme="chart-2"
				/>,
			);

			expect(screen.getByText("年度销售配额")).toBeInTheDocument();
			expect(screen.getByText("75%")).toBeInTheDocument();
			expect(screen.getByText("稳步推进")).toBeInTheDocument();
			expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
			const progressbar = container.querySelector("[data-slot=progress]");
			expect(progressbar?.className).toContain("[&>[data-slot=progress-indicator]]:bg-chart-2");
		});

		it("guards non-finite progress values in ProgressStatCard", () => {
			renderWithProviders(<ProgressStatCard title="异常目标" value={100} progress={Number.NaN} />);

			expect(screen.queryByText("NaN%")).not.toBeInTheDocument();
			expect(screen.getByText("0%")).toBeInTheDocument();
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

		it("filters non-finite values in MiniSparkline without breaking SVG paths", () => {
			const { container, rerender } = renderWithProviders(
				<MiniSparkline data={[10, Number.NaN, Number.POSITIVE_INFINITY, 30]} type="area" width={100} height={30} />,
			);

			const path = container.querySelector("path");
			expect(path).toBeInTheDocument();
			expect(path?.getAttribute("d")).not.toContain("NaN");

			rerender(<MiniSparkline data={[Number.NaN]} type="area" width={100} height={30} />);
			expect(container.querySelector("path")).toBeNull();
		});
	});

	describe("useDemoTelemetryTicker (Localized & Showcase-Isolated)", () => {
		it("initializes localized lastUpdated and appends exactly one sparkline point per tick", () => {
			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<NextIntlClientProvider locale="zh" messages={zhMessages}>
					{children}
				</NextIntlClientProvider>
			);

			const { result } = renderHook(
				() =>
					useDemoTelemetryTicker({
						initialValue: 100,
						initialData: [90, 95, 100],
						bufferSize: 10,
						autoStart: false,
					}),
				{ wrapper },
			);

			expect(result.current.lastUpdated).toBe("刚刚");
			expect(result.current.sparklineData).toHaveLength(3);

			act(() => {
				result.current.tick();
			});

			expect(result.current.sparklineData).toHaveLength(4);
			expect(result.current.lastUpdated).not.toBe("刚刚");
		});
	});

	describe("Industrial A11y, Stretched-Link & Edge Guards", () => {
		it("uses Stretched-Link sibling pattern so copy & tooltip buttons are never nested inside <a>", () => {
			renderWithProviders(
				<StatCard
					title="钻取复制卡片"
					value={99.5}
					formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
					description="统计口径说明"
					copyable
					to="/orders"
				/>,
			);

			expect(screen.getByText("99.50")).toBeInTheDocument();
			const link = screen.getByRole("link", { name: "钻取复制卡片" });
			const copyBtn = screen.getByRole("button", { name: "复制数值" });
			const helpBtn = screen.getByRole("button", { name: "统计口径说明" });

			expect(link).toHaveAttribute("href", "/orders");
			expect(link.contains(copyBtn)).toBe(false);
			expect(link.contains(helpBtn)).toBe(false);
			expect(helpBtn.tagName).toBe("BUTTON");
			expect(helpBtn.querySelector(".sr-only")).toBeNull();
		});

		it("uses Stretched-Button sibling pattern without nested interactive elements and supports keyboard Enter/Space", async () => {
			const handleCardClick = vi.fn();
			const { user } = renderWithProviders(
				<StatCard title="可聚焦卡片" value={42} copyable onClick={handleCardClick} />,
			);

			const cardButton = screen.getByRole("button", { name: "可聚焦卡片" });
			const copyBtn = screen.getByRole("button", { name: "复制数值" });
			expect(cardButton.tagName).toBe("BUTTON");
			expect(cardButton.contains(copyBtn)).toBe(false);

			cardButton.focus();
			expect(cardButton).toHaveFocus();
			await user.keyboard("{Enter}");
			await user.keyboard(" ");
			expect(handleCardClick).toHaveBeenCalledTimes(2);
		});

		it("respects reverse polarity and explicit tone in MultiMetricStatCard MetricRow", () => {
			const { container } = renderWithProviders(
				<MultiMetricStatCard
					title="延迟与错误预算"
					primaryValue={120}
					suffix="ms"
					metrics={[
						{ label: "P99 延迟", value: 185, trend: { value: -12, direction: "down", isPositiveGood: false } },
						{ label: "错误率", value: "0.4%", trend: { value: "+0.1%", tone: "negative" } },
					]}
				/>,
			);

			expect(container.querySelector(".text-chart-2")).toBeInTheDocument();
			expect(container.querySelector(".text-destructive")).toBeInTheDocument();
		});

		it("supports LiveStatCard stale/error/onRetry and motion-reduce ping protection", () => {
			const handleRetry = vi.fn();
			const { container, rerender } = renderWithProviders(
				<LiveStatCard title="遥测流" value={2048} isStale lastUpdated={new Date("2026-01-01T08:00:00Z")} />,
			);

			expect(screen.getByText("数据已过期")).toBeInTheDocument();
			expect(container.querySelector(".animate-ping")).toBeNull();

			rerender(
				<LiveStatCard
					title="遥测流"
					value={2048}
					status="online"
					pulse
					errorMessage="连接超时"
					onRetry={handleRetry}
				/>,
			);

			expect(screen.getByText("服务异常")).toBeInTheDocument();
			expect(screen.getByText("连接超时")).toBeInTheDocument();
			const retryBtn = screen.getByRole("button", { name: "重试" });
			fireEvent.click(retryBtn);
			expect(handleRetry).toHaveBeenCalledTimes(1);

			rerender(<LiveStatCard title="遥测流" value={2048} status="online" pulse />);
			const pingDot = container.querySelector(".animate-ping");
			expect(pingDot?.className).toContain("motion-reduce:animate-none");
		});

		it("renders StatCardSkeleton variants with accessible status role and zero-CLS py-0 padding", () => {
			renderWithProviders(<StatCardSkeleton variant="progress" />);
			const statusCard = screen.getByRole("status");
			expect(statusCard).toHaveAttribute("aria-busy", "true");
			expect(statusCard.className).toContain("py-0");
			expect(screen.getByText("加载中...")).toBeInTheDocument();
		});

		it("guards NaN in StatCardValue with localized no_data fallback", () => {
			renderWithProviders(<StatCardValue value={Number.NaN} />);
			expect(screen.getByText("--")).toBeInTheDocument();
			expect(screen.queryByText("NaN")).not.toBeInTheDocument();
		});

		it("exposes role=img and localized trend label on non-decorative MiniSparkline only when requested", () => {
			const { container, rerender } = renderWithProviders(<MiniSparkline data={[10, 20, 35]} decorative={false} />);

			const accessibleSvg = screen.getByRole("img");
			expect(accessibleSvg).toHaveAttribute("aria-label");
			expect(accessibleSvg.getAttribute("aria-label")).toContain("35");

			rerender(<MiniSparkline data={[10, 20, 35]} />);
			expect(screen.queryByRole("img")).toBeNull();
			expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
		});

		it("applies focus ring classes on stretched Link in StatCardRoot", () => {
			renderWithProviders(<StatCard title="焦点环测试卡片" value={10} to="/orders" />);
			const link = screen.getByRole("link", { name: "焦点环测试卡片" });
			expect(link.className).toContain("focus-visible:ring-2");
			expect(link.className).toContain("focus-visible:ring-ring");
		});

		it("formats downward numeric trend with minus sign and ignores blank trend value", () => {
			const { container } = renderWithProviders(
				<>
					<StatCard title="延迟指标" value={50} trend={{ value: 0.08, direction: "down", isPositiveGood: false }} />
					<StatCard title="空趋势卡片" value={100} trend={{ value: "   " }} />
				</>,
			);

			expect(screen.getByText("-0.08")).toBeInTheDocument();
			expect(screen.queryByText("+0.08")).not.toBeInTheDocument();
			expect(container.querySelectorAll("[data-slot=badge]")).toHaveLength(1);
		});

		it("clamps negative derived progress to 0% and hides copy button on NaN/empty values", () => {
			const { rerender } = renderWithProviders(
				<>
					<ProgressStatCard title="负值目标" value={-50} targetValue={100} />
					<StatCardValue value={Number.NaN} copyable />
				</>,
			);

			expect(screen.getByText("0%")).toBeInTheDocument();
			expect(screen.queryByText("-50%")).not.toBeInTheDocument();
			expect(screen.queryByRole("button", { name: "复制数值" })).toBeNull();

			rerender(<StatCardValue value="   " copyable />);
			expect(screen.queryByRole("button", { name: "复制数值" })).toBeNull();
		});

		it("uses live_paused fallback when LiveStatCard is offline without lastUpdated", () => {
			const { container } = renderWithProviders(
				<LiveStatCard title="离线节点" value={0} status="offline" sparklineData={[Number.NaN]} />,
			);

			expect(screen.getByText("已暂停刷新")).toBeInTheDocument();
			expect(container.querySelector(".w-24")).toBeNull();
		});

		it("syncs useNumberTween cleanly across enabled toggle and guards non-finite targetValue", async () => {
			const { result, rerender } = renderHook(
				({ target, enabled }) => useNumberTween(target, { enabled, duration: 200 }),
				{ initialProps: { target: 100, enabled: false } },
			);

			expect(result.current).toBe(100);
			rerender({ target: 500, enabled: false });
			expect(result.current).toBe(500);

			await act(async () => {
				rerender({ target: 500, enabled: true });
				await Promise.resolve();
			});
			expect(result.current).toBe(500);

			rerender({ target: Number.NaN, enabled: true });
			expect(result.current).toBe(0);
		});

		it("guards empty targetValue on ProgressStatCard and syncs gradient/stroke safety on MiniSparkline", () => {
			const { container } = renderWithProviders(
				<>
					<ProgressStatCard title="无目标文本" value={60} targetValue="" progress={60} />
					<MiniSparkline data={[10, 30, 20]} type="area" gradientId="#!" />
				</>,
			);

			expect(screen.queryByText(/目标:/)).toBeNull();
			const progress = container.querySelector("[data-slot=progress]");
			expect(progress).toHaveAttribute("data-value", "60");
			expect(progress).toHaveAttribute("data-state", "loading");

			const grad = container.querySelector("linearGradient");
			expect(grad?.getAttribute("id")).toMatch(/^spark-grad-/);
			const strokePath = container.querySelector("path[fill='none']");
			expect(strokePath).toHaveAttribute("vector-effect", "non-scaling-stroke");
		});

		it("announces LiveStatCard errors via alert role and handles null values across card variants", () => {
			renderWithProviders(
				<>
					<LiveStatCard title="空值遥测" value={null} errorMessage="连接断开" />
					<ProgressStatCard title="空值进度" value={null} targetValue={100} />
					<MultiMetricStatCard title="空值多指标" primaryValue={null} metrics={[{ label: "子指标", value: null }]} />
				</>,
			);

			expect(screen.getByRole("alert")).toHaveTextContent("连接断开");
			expect(screen.getAllByText("--").length).toBeGreaterThanOrEqual(4);
		});
	});
});
