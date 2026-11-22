"use client";

import {
	Activity,
	AlertCircle,
	ArrowUpRight,
	BarChart3,
	Cpu,
	DollarSign,
	HardDrive,
	Server,
	ShieldCheck,
	Users,
} from "lucide-react";

import { LiveStatCard } from "@/components/stats/live-card/LiveStatCard";
import { MultiMetricStatCard } from "@/components/stats/multi-metric-card/MultiMetricStatCard";
import { ProgressStatCard } from "@/components/stats/progress-card/ProgressStatCard";
import { StatCard } from "@/components/stats/stat-card/StatCard";

import { useDemoTelemetryControls, useDemoTelemetryData } from "../context/DemoTelemetryContext";
import { CardsDensitySection, CardsSparklineSection } from "./CardsExtraSections";

function CardsLiveTelemetryCard() {
	const { value, sparklineData, status, lastUpdated } = useDemoTelemetryData();
	const { isRunning } = useDemoTelemetryControls();

	return (
		<LiveStatCard
			title="Real-Time Event Stream"
			value={value}
			suffix=" events/sec"
			icon={Activity}
			status={status}
			statusText={isRunning ? "LIVE WEBSOCKET" : "PAUSED"}
			lastUpdated={lastUpdated}
			sparklineData={sparklineData}
			pulse={isRunning}
			description="Sub-millisecond reactive event pipe buffer with dynamic sparkline"
		/>
	);
}

export function CardsTab() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-foreground text-lg font-semibold">1. Standard StatCards with Sparklines & Themes</h2>
				<p className="text-muted-foreground text-xs">
					Flexible status indicators, sparkline micro-charts, and customizable trends.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Primary Revenue"
					value={24890}
					prefix="$"
					icon={DollarSign}
					trend={{ value: 14.2, direction: "up", label: "vs last week" }}
					sparklineData={[10, 15, 12, 18, 22, 19, 24, 28]}
					theme="primary"
				/>
				<StatCard
					title="Active Sessions"
					value={1840}
					icon={Users}
					trend={{ value: 3.1, direction: "up", label: "vs yesterday" }}
					sparklineData={[12, 14, 18, 17, 21, 24, 25]}
					theme="chart-2"
				/>
				<StatCard
					title="System Memory Load"
					value={88.4}
					suffix="%"
					icon={Cpu}
					trend={{ value: 12.0, direction: "up", label: "threshold 85%" }}
					sparklineData={[60, 65, 70, 72, 80, 84, 88]}
					theme="chart-3"
				/>
				<StatCard
					title="Critical Error Rate"
					value={0.04}
					suffix="%"
					icon={AlertCircle}
					trend={{ value: 0.08, direction: "down", isPositiveGood: false, label: "-0.08% improvement" }}
					sparklineData={[1.2, 0.9, 0.7, 0.5, 0.3, 0.1, 0.04]}
					theme="destructive"
				/>
			</div>

			<div className="pt-4">
				<h2 className="text-foreground text-lg font-semibold">2. ProgressStatCard (Goal Pacing & Theme Accents)</h2>
				<p className="text-muted-foreground text-xs">
					Clear visual feedback on progress bars with intent coloring and pacing metadata.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ProgressStatCard
					title="Sales Pipeline"
					value={390000}
					targetValue={500000}
					prefix="$"
					progress={78}
					theme="primary"
					icon={ArrowUpRight}
					pacingLabel="Goal: $500k"
					description="14 deals scheduled to close this week"
				/>
				<ProgressStatCard
					title="Security Hardening"
					value={94}
					targetValue={100}
					suffix="%"
					progress={94}
					theme="chart-2"
					icon={ShieldCheck}
					pacingLabel="SOC2 Type II"
					description="23/24 audit checks fully satisfied"
				/>
				<ProgressStatCard
					title="Storage Pool Capacity"
					value={4.3}
					targetValue={5.0}
					suffix="TB"
					progress={86}
					theme="chart-3"
					icon={HardDrive}
					pacingLabel="4.3TB / 5.0TB"
					description="Consider expanding NVMe volume"
				/>
				<ProgressStatCard
					title="API Error Budget Burn"
					value={91}
					targetValue={100}
					suffix="%"
					progress={91}
					theme="destructive"
					icon={AlertCircle}
					pacingLabel="Budget: 99.9%"
					description="Burn rate exceeds standard SLO limit"
				/>
			</div>

			<div className="pt-4">
				<h2 className="text-foreground text-lg font-semibold">3. MultiMetric & Live Streaming Stat Cards</h2>
				<p className="text-muted-foreground text-xs">
					Density-optimized cards for compound metrics and real-time pulse animations.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<MultiMetricStatCard
					title="Hardware Node Utilization"
					primaryValue="98.2%"
					primaryLabel="System Health"
					icon={Server}
					metrics={[
						{ label: "CPU 16 Cores", value: "34%", trend: { value: 5.2, direction: "down" } },
						{ label: "RAM 64GB", value: "52%", trend: { value: 2.1, direction: "up" } },
						{ label: "Disk NVMe", value: "68%", trend: { value: 0.4, direction: "up" } },
					]}
				/>

				<MultiMetricStatCard
					title="Marketing Attribution Funnel"
					primaryValue="4.18%"
					primaryLabel="Avg Conversion"
					suffix=" CVR"
					icon={BarChart3}
					metrics={[
						{ label: "Ad Impressions", value: "480k", trend: { value: 18.2, direction: "up" } },
						{ label: "Click-Through", value: "3.4%", trend: { value: 0.8, direction: "up" } },
						{ label: "Activated", value: "1,240", trend: { value: 9.6, direction: "up" } },
					]}
				/>

				<CardsLiveTelemetryCard />
			</div>

			<CardsSparklineSection />
			<CardsDensitySection />
		</div>
	);
}
