"use client";

import { useState } from "react";
import { Activity, AlertCircle, Layers, LineChart, PieChart } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StatsHeaderBar } from "./components/StatsHeaderBar";
import { TREND_DATA_MAP } from "./constants";
import { DemoTelemetryProvider } from "./context/DemoTelemetryContext";
import { CardsTab } from "./tabs/CardsTab";
import { DistributionTab } from "./tabs/DistributionTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { StatesTab } from "./tabs/StatesTab";
import { TrendsTab } from "./tabs/TrendsTab";
import type { DemoState, TimeRange } from "./types";

export function StatsShowcasePage() {
	const [activeTab, setActiveTab] = useState<string>("overview");
	const [timeRange, setTimeRange] = useState<TimeRange>("7d");
	const [demoState, setDemoState] = useState<DemoState>("normal");

	const currentTrendData = TREND_DATA_MAP[timeRange];

	const isLoading = demoState === "loading";
	const isError = demoState === "error";
	const isEmpty = demoState === "empty";

	return (
		<DemoTelemetryProvider>
			<div className="space-y-6">
				<StatsHeaderBar demoState={demoState} onDemoStateChange={setDemoState} />

				{/* Primary Navigation Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid h-auto! w-full max-w-2xl grid-cols-2 gap-1 sm:grid-cols-5">
						<TabsTrigger value="overview" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
							<Layers className="size-3.5" aria-hidden="true" />
							Overview
						</TabsTrigger>
						<TabsTrigger value="cards" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
							<Activity className="size-3.5" aria-hidden="true" />
							Card Matrix
						</TabsTrigger>
						<TabsTrigger value="trends" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
							<LineChart className="size-3.5" aria-hidden="true" />
							Trends
						</TabsTrigger>
						<TabsTrigger value="distribution" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
							<PieChart className="size-3.5" aria-hidden="true" />
							Multi-Dim
						</TabsTrigger>
						<TabsTrigger value="states" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
							<AlertCircle className="size-3.5" aria-hidden="true" />
							State Lab
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="mt-6 flex flex-col gap-6">
						<OverviewTab
							demoState={demoState}
							isLoading={isLoading}
							isError={isError}
							isEmpty={isEmpty}
							timeRange={timeRange}
							onTimeRangeChange={setTimeRange}
							currentTrendData={currentTrendData}
						/>
					</TabsContent>

					<TabsContent value="cards" className="mt-6 flex flex-col gap-6">
						<CardsTab />
					</TabsContent>

					<TabsContent value="trends" className="mt-6 flex flex-col gap-6">
						<TrendsTab timeRange={timeRange} onTimeRangeChange={setTimeRange} currentTrendData={currentTrendData} />
					</TabsContent>

					<TabsContent value="distribution" className="mt-6 flex flex-col gap-6">
						<DistributionTab />
					</TabsContent>

					<TabsContent value="states" className="mt-6 flex flex-col gap-6">
						<StatesTab demoState={demoState} onDemoStateChange={setDemoState} isLoading={isLoading} isError={isError} />
					</TabsContent>
				</Tabs>
			</div>
		</DemoTelemetryProvider>
	);
}
