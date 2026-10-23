"use client";

import { useMemoizedFn } from "ahooks";
import { delay } from "es-toolkit";
import { Briefcase, Gauge, PieChart as PieChartIcon, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartsFeatureHighlights } from "./components/ChartsFeatureHighlights";
import { ChartsHeaderBar } from "./components/ChartsHeaderBar";
import { TIME_RANGE_DATA } from "./constants";
import { AllOverviewTab } from "./tabs/AllOverviewTab";
import { DistributionShowcaseTab } from "./tabs/DistributionShowcaseTab";
import { EnterpriseShowcaseTab } from "./tabs/EnterpriseShowcaseTab";
import { GaugesShowcaseTab } from "./tabs/GaugesShowcaseTab";
import { TrendsShowcaseTab } from "./tabs/TrendsShowcaseTab";
import type { ChartStateProps, DemoState, TimeRange } from "./types";

export function ChartsShowcasePage() {
  const [activePeriod, setActivePeriod] = useState<TimeRange>("7d");
  const [demoState, setDemoState] = useState<DemoState>("normal");

  const trendData = TIME_RANGE_DATA[activePeriod];

  const handlePeriodChange = useMemoizedFn((newPeriod: string) => {
    setActivePeriod(newPeriod as TimeRange);
  });

  const handleRetry = useMemoizedFn(async () => {
    setDemoState("loading");
    await delay(700);
    setDemoState("normal");
  });

  const chartStateProps: ChartStateProps = {
    isLoading: demoState === "loading",
    isEmpty: demoState === "empty",
    errorMessage: demoState === "error" ? "图表数据请求异常，无法加载最新聚合指标 (HTTP 502)" : undefined,
    onRetry: handleRetry,
  };

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-6 p-4 pt-6 md:p-8">
      <ChartsHeaderBar demoState={demoState} onDemoStateChange={setDemoState} onRefresh={handleRetry} />

      <ChartsFeatureHighlights />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/70 grid h-auto! w-full grid-cols-2 gap-1 border p-1 sm:grid-cols-3 xl:grid-cols-5">
          <TabsTrigger value="all" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            全景图表 (Overview)
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <TrendingUp className="h-3.5 w-3.5" />
            趋势与混合 (Trend & Composed)
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <PieChartIcon className="h-3.5 w-3.5" />
            分布与排名 (Distribution)
          </TabsTrigger>
          <TabsTrigger value="gauges" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <Gauge className="h-3.5 w-3.5" />
            度量与仪表盘 (Gauges & Radar)
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal">
            <Briefcase className="h-3.5 w-3.5" />
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

export default ChartsShowcasePage;
