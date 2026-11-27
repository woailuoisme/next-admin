"use client";

import dynamic from "next/dynamic";
import { Briefcase, Gauge, PieChart as PieChartIcon, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartsFeatureHighlights } from "./components/ChartsFeatureHighlights";
import { ChartsHeaderBar } from "./components/ChartsHeaderBar";
import { TIME_RANGE_DATA } from "./constants";
import { AllOverviewTab } from "./tabs/AllOverviewTab";
import type { ChartStateProps, DemoState, TimeRange } from "./types";

const TrendsShowcaseTab = dynamic(() => import("./tabs/TrendsShowcaseTab").then((m) => m.TrendsShowcaseTab), {
	loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
});

const DistributionShowcaseTab = dynamic(
	() => import("./tabs/DistributionShowcaseTab").then((m) => m.DistributionShowcaseTab),
	{ loading: () => <Skeleton className="h-80 w-full rounded-xl" /> },
);

const GaugesShowcaseTab = dynamic(() => import("./tabs/GaugesShowcaseTab").then((m) => m.GaugesShowcaseTab), {
	loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
});

const EnterpriseShowcaseTab = dynamic(
	() => import("./tabs/EnterpriseShowcaseTab").then((m) => m.EnterpriseShowcaseTab),
	{ loading: () => <Skeleton className="h-80 w-full rounded-xl" /> },
);

export function ChartsShowcasePage() {
	const [activePeriod, setActivePeriod] = useState<TimeRange>("7d");
	const [demoState, setDemoState] = useState<DemoState>("normal");
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
		};
	}, []);

	const trendData = TIME_RANGE_DATA[activePeriod];

	const handlePeriodChange = (newPeriod: string) => {
		setActivePeriod(newPeriod as TimeRange);
	};

	const handleRetry = () => {
		if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
		setDemoState("loading");
		retryTimerRef.current = setTimeout(() => {
			retryTimerRef.current = null;
			setDemoState("normal");
		}, 700);
	};

	const chartStateProps: ChartStateProps = {
		isLoading: demoState === "loading",
		isEmpty: demoState === "empty",
		errorMessage: demoState === "error" ? "图表数据请求异常，无法加载最新聚合指标 (HTTP 502)" : undefined,
		onRetry: handleRetry,
	};

	return (
		<div className="space-y-6">
			<ChartsHeaderBar demoState={demoState} onDemoStateChange={setDemoState} onRefresh={handleRetry} />

			<ChartsFeatureHighlights />

			<Tabs defaultValue="all" className="flex flex-col gap-6">
				<TabsList className="bg-muted/70 grid h-auto! w-full grid-cols-2 gap-1 border p-1 sm:grid-cols-3 xl:grid-cols-5">
					<TabsTrigger value="all" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
						<SlidersHorizontal className="size-3.5" aria-hidden="true" />
						全景图表 (Overview)
					</TabsTrigger>
					<TabsTrigger value="trends" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
						<TrendingUp className="size-3.5" aria-hidden="true" />
						趋势与混合 (Trend & Composed)
					</TabsTrigger>
					<TabsTrigger value="distribution" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
						<PieChartIcon className="size-3.5" aria-hidden="true" />
						分布与排名 (Distribution)
					</TabsTrigger>
					<TabsTrigger value="gauges" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
						<Gauge className="size-3.5" aria-hidden="true" />
						度量与仪表盘 (Gauges & Radar)
					</TabsTrigger>
					<TabsTrigger value="enterprise" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
						<Briefcase className="size-3.5" aria-hidden="true" />
						商业分析 (Enterprise)
					</TabsTrigger>
				</TabsList>

				<AllOverviewTab
					activePeriod={activePeriod}
					onPeriodChange={handlePeriodChange}
					chartStateProps={chartStateProps}
					trendData={trendData}
				/>

				<TrendsShowcaseTab
					activePeriod={activePeriod}
					onPeriodChange={handlePeriodChange}
					chartStateProps={chartStateProps}
					trendData={trendData}
				/>

				<DistributionShowcaseTab chartStateProps={chartStateProps} />

				<GaugesShowcaseTab chartStateProps={chartStateProps} />

				<EnterpriseShowcaseTab chartStateProps={chartStateProps} />
			</Tabs>
		</div>
	);
}
