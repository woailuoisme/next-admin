"use client";

import { useState } from "react";
import { useMemoizedFn } from "ahooks";
import { Activity, AlertCircle, Layers, LineChart, PieChart } from "lucide-react";

import { useLiveTicker } from "@/components/stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StatsHeaderBar } from "./components/StatsHeaderBar";
import { TREND_DATA_MAP } from "./constants";
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

  const handleTimeRangeChange = useMemoizedFn((tr: TimeRange) => setTimeRange(tr));
  const handleDemoStateChange = useMemoizedFn((st: DemoState) => setDemoState(st));
  const handleTabChange = useMemoizedFn((tab: string) => setActiveTab(tab));

  const liveTicker = useLiveTicker({
    initialValue: 1420,
    intervalMs: 2500,
    bufferSize: 12,
    min: 1200,
    max: 1800,
    volatility: 0.04,
  });

  const currentTrendData = TREND_DATA_MAP[timeRange];

  const isLoading = demoState === "loading";
  const isError = demoState === "error";
  const isEmpty = demoState === "empty";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <StatsHeaderBar
        demoState={demoState}
        onDemoStateChange={handleDemoStateChange}
        liveTicker={liveTicker}
      />

      {/* Primary Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid h-auto! w-full max-w-2xl grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger value="overview" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <Layers className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <Activity className="h-3.5 w-3.5" />
            Card Matrix
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <LineChart className="h-3.5 w-3.5" />
            Trends
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <PieChart className="h-3.5 w-3.5" />
            Multi-Dim
          </TabsTrigger>
          <TabsTrigger value="states" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <AlertCircle className="h-3.5 w-3.5" />
            State Lab
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <OverviewTab
            demoState={demoState}
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            liveTicker={liveTicker}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            currentTrendData={currentTrendData}
          />
        </TabsContent>

        <TabsContent value="cards" className="mt-6 space-y-6">
          <CardsTab liveTicker={liveTicker} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          <TrendsTab
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            currentTrendData={currentTrendData}
          />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6 space-y-6">
          <DistributionTab />
        </TabsContent>

        <TabsContent value="states" className="mt-6 space-y-6">
          <StatesTab
            demoState={demoState}
            onDemoStateChange={handleDemoStateChange}
            isLoading={isLoading}
            isError={isError}
            liveTicker={liveTicker}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StatsShowcasePage;
