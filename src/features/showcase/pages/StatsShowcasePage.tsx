"use client";

import { useMemoizedFn } from "ahooks";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  HardDrive,
  Layers,
  LineChart,
  PieChart,
  RefreshCw,
  Server,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

import {
  AreaTrendChart,
  BarTrendChart,
  ComposedTrendChart,
  DonutDistributionChart,
  HorizontalBarChart,
  LineTrendChart,
  RadarMetricChart,
  RadialGaugeChart,
} from "@/components/chart";
import {
  LiveStatCard,
  MultiMetricStatCard,
  ProgressStatCard,
  Sparkline,
  type SparklineLayout,
  StatCard,
  type StatDensity,
  StatsGrid,
  useLiveTicker,
} from "@/components/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeRange = "7d" | "30d" | "90d" | "12m";
type DemoState = "normal" | "loading" | "empty" | "error";

const TIME_RANGES: readonly TimeRange[] = ["7d", "30d", "90d", "12m"] as const;
const DEMO_STATES: readonly DemoState[] = ["normal", "loading", "empty", "error"] as const;

interface RawTrendItem {
  label: string;
  value: number;
  revenue: number;
  cost: number;
  users: number;
  conversion: number;
  [key: string]: unknown;
}

// Mock datasets for different time ranges
const TREND_DATA_MAP: Record<TimeRange, RawTrendItem[]> = {
  "7d": [
    {
      label: "Mon",
      value: 4200,
      revenue: 4200,
      cost: 1800,
      users: 1200,
      conversion: 3.2,
    },
    {
      label: "Tue",
      value: 5100,
      revenue: 5100,
      cost: 2100,
      users: 1450,
      conversion: 3.6,
    },
    {
      label: "Wed",
      value: 4800,
      revenue: 4800,
      cost: 1950,
      users: 1380,
      conversion: 3.4,
    },
    {
      label: "Thu",
      value: 6200,
      revenue: 6200,
      cost: 2400,
      users: 1720,
      conversion: 4.1,
    },
    {
      label: "Fri",
      value: 7400,
      revenue: 7400,
      cost: 2800,
      users: 2100,
      conversion: 4.5,
    },
    {
      label: "Sat",
      value: 8900,
      revenue: 8900,
      cost: 3100,
      users: 2450,
      conversion: 4.8,
    },
    {
      label: "Sun",
      value: 9500,
      revenue: 9500,
      cost: 3300,
      users: 2680,
      conversion: 5.2,
    },
  ],
  "30d": [
    {
      label: "Week 1",
      value: 28000,
      revenue: 28000,
      cost: 11200,
      users: 8400,
      conversion: 3.5,
    },
    {
      label: "Week 2",
      value: 34500,
      revenue: 34500,
      cost: 13400,
      users: 9800,
      conversion: 3.9,
    },
    {
      label: "Week 3",
      value: 41200,
      revenue: 41200,
      cost: 15600,
      users: 11500,
      conversion: 4.3,
    },
    {
      label: "Week 4",
      value: 48900,
      revenue: 48900,
      cost: 17800,
      users: 13200,
      conversion: 4.7,
    },
  ],
  "90d": [
    {
      label: "Month 1",
      value: 125000,
      revenue: 125000,
      cost: 48000,
      users: 38000,
      conversion: 3.8,
    },
    {
      label: "Month 2",
      value: 158000,
      revenue: 158000,
      cost: 56000,
      users: 46000,
      conversion: 4.2,
    },
    {
      label: "Month 3",
      value: 194000,
      revenue: 194000,
      cost: 65000,
      users: 55000,
      conversion: 4.6,
    },
  ],
  "12m": [
    {
      label: "Q1",
      value: 420000,
      revenue: 420000,
      cost: 160000,
      users: 120000,
      conversion: 3.9,
    },
    {
      label: "Q2",
      value: 540000,
      revenue: 540000,
      cost: 195000,
      users: 155000,
      conversion: 4.2,
    },
    {
      label: "Q3",
      value: 680000,
      revenue: 680000,
      cost: 235000,
      users: 195000,
      conversion: 4.5,
    },
    {
      label: "Q4",
      value: 850000,
      revenue: 850000,
      cost: 280000,
      users: 240000,
      conversion: 4.9,
    },
  ],
};

const DISTRIBUTION_DATA = [
  { name: "Enterprise", value: 45000, color: "var(--primary)" },
  { name: "Professional", value: 32000, color: "var(--chart-1)" },
  { name: "Starter", value: 18000, color: "var(--chart-2)" },
  { name: "Personal", value: 8500, color: "var(--chart-3)" },
];

const HORIZONTAL_RANKINGS = [
  { label: "API Gateway (Auth)", value: 48200, color: "var(--chart-1)" },
  { label: "Checkout Engine", value: 39400, color: "var(--chart-2)" },
  { label: "Search & Vector Index", value: 28600, color: "var(--chart-3)" },
  { label: "Analytics Pipeline", value: 19200, color: "var(--chart-4)" },
  { label: "Notification Worker", value: 12400, color: "var(--chart-5)" },
];

const RADAR_METRICS = [
  { subject: "Reliability", score: 98, fullMark: 100 },
  { subject: "Performance", score: 92, fullMark: 100 },
  { subject: "Security", score: 96, fullMark: 100 },
  { subject: "Usability", score: 88, fullMark: 100 },
  { subject: "Scalability", score: 94, fullMark: 100 },
  { subject: "Compliance", score: 90, fullMark: 100 },
];

const SPARKLINE_AREA_ITEMS = [
  { name: "Primary", theme: "primary", data: [12, 18, 14, 25, 22, 30, 28] },
  { name: "Chart 1", theme: "chart-1", data: [32, 28, 25, 22, 29, 31, 35] },
  { name: "Chart 2", theme: "chart-2", data: [8, 15, 22, 19, 27, 34, 40] },
  { name: "Chart 3", theme: "chart-3", data: [45, 42, 38, 35, 40, 36, 33] },
  { name: "Chart 4", theme: "chart-4", data: [14, 20, 16, 28, 24, 38, 42] },
  {
    name: "Destructive",
    theme: "destructive",
    data: [50, 42, 35, 28, 20, 15, 12],
  },
] as const;

const SPARKLINE_BAR_ITEMS = [
  { name: "Primary", theme: "primary", data: [12, 18, 14, 25, 22, 30, 28] },
  { name: "Chart 1", theme: "chart-1", data: [32, 28, 25, 22, 29, 31, 35] },
  { name: "Chart 2", theme: "chart-2", data: [8, 15, 22, 19, 27, 34, 40] },
  { name: "Chart 3", theme: "chart-3", data: [45, 42, 38, 35, 40, 36, 33] },
  { name: "Chart 4", theme: "chart-4", data: [14, 20, 16, 28, 24, 38, 42] },
  {
    name: "Destructive",
    theme: "destructive",
    data: [50, 42, 35, 28, 20, 15, 12],
  },
] as const;

export function StatsShowcasePage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [demoState, setDemoState] = useState<DemoState>("normal");
  const [cardDensity, setCardDensity] = useState<StatDensity>("compact");
  const [cardSparklineLayout, setCardSparklineLayout] = useState<SparklineLayout>("inline");

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
      {/* Header Banner */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Enterprise Stats & Visualizations
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              v2.0 Toolkit
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            High-performance, composable statistics cards, real-time gauges, and Recharts widgets.
          </p>
        </div>

        {/* Global Demo Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
            {DEMO_STATES.map((st) => (
              <Button
                key={st}
                size="sm"
                variant={demoState === st ? "secondary" : "ghost"}
                className="h-7 text-xs capitalize"
                onClick={() => handleDemoStateChange(st)}
              >
                {st}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={liveTicker.tick}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Pulse Step
          </Button>
          <Button
            variant={liveTicker.isRunning ? "secondary" : "default"}
            size="sm"
            className="h-8 font-mono text-xs"
            onClick={liveTicker.toggle}
          >
            {liveTicker.isRunning ? "Pause Stream" : "Resume Stream"}
          </Button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid h-auto! w-full max-w-2xl grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger
            value="overview"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <Layers className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="cards"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <Activity className="h-3.5 w-3.5" />
            Card Matrix
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
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
          <TabsTrigger
            value="states"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            State Lab
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW (BUSINESS COMMAND COCKPIT)           */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Top KPI 4-Card Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue (ARR)"
              value={demoState === "empty" ? 0 : 849200}
              prefix="$"
              icon={DollarSign}
              trend={{ value: 18.4, direction: "up", label: "vs last quarter" }}
              sparklineData={
                demoState === "empty" ? undefined : [20, 24, 28, 26, 32, 38, 42, 49, 58, 65]
              }
              isLoading={isLoading}
              theme={isError ? "destructive" : "primary"}
              description="Recognized recurring subscription revenue"
            />

            <ProgressStatCard
              title="Monthly Quota Target"
              value={demoState === "empty" ? 0 : 825000}
              targetValue={1000000}
              prefix="$"
              progress={demoState === "empty" ? 0 : 82.5}
              theme="primary"
              icon={TrendingUp}
              trend={{ value: 6.2, direction: "up", label: "target: $1.0M" }}
              pacingLabel="Ahead of benchmark by 12%"
              isLoading={isLoading}
              description="Recognized towards month target"
            />

            <MultiMetricStatCard
              title="Core Platform Conversion"
              primaryValue={demoState === "empty" ? 0 : 4.82}
              suffix="%"
              icon={Zap}
              isLoading={isLoading}
              metrics={[
                {
                  label: "Visitors",
                  value: demoState === "empty" ? 0 : "128.4k",
                  trend: { value: 12.5, direction: "up" },
                },
                {
                  label: "Signups",
                  value: demoState === "empty" ? 0 : "6,190",
                  trend: { value: 8.2, direction: "up" },
                },
                {
                  label: "Paid",
                  value: demoState === "empty" ? 0 : "1,420",
                  trend: { value: 14.1, direction: "up" },
                },
              ]}
            />

            <LiveStatCard
              title="Live Stream / SSE Nodes"
              value={demoState === "empty" ? 0 : liveTicker.value}
              suffix=" nodes"
              icon={Server}
              status={isError ? "error" : liveTicker.status}
              statusText={liveTicker.isRunning ? "Cluster Healthy" : "Stream Paused"}
              isLoading={isLoading}
              sparklineData={liveTicker.buffer}
              pulse={liveTicker.isRunning}
              lastUpdated="Live"
              description="Real-time connected client sessions (powered by ahooks useLiveTicker)"
            />
          </div>

          {/* Mid Cockpit Row: Composed Trend + Donut */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="shadow-xs lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Financial Inflow vs Operation Expense
                  </CardTitle>
                  <CardDescription>
                    Multi-axis composed projection (Bars = Cost, Line = Revenue)
                  </CardDescription>
                </div>
                <div className="bg-muted/30 flex items-center gap-1 rounded-md border p-1">
                  {TIME_RANGES.map((tr) => (
                    <Button
                      key={tr}
                      size="sm"
                      variant={timeRange === tr ? "default" : "ghost"}
                      className="h-6 px-2 text-xs uppercase"
                      onClick={() => handleTimeRangeChange(tr)}
                    >
                      {tr}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {isEmpty ? (
                  <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
                    No transaction records found for range: {timeRange}
                  </div>
                ) : (
                  <ComposedTrendChart
                    data={currentTrendData}
                    xAxisKey="label"
                    height={300}
                    bars={[
                      {
                        dataKey: "cost",
                        name: "Operational Cost",
                        color: "color-mix(in oklab, var(--muted-foreground) 40%, transparent)",
                      },
                    ]}
                    lines={[
                      {
                        dataKey: "revenue",
                        name: "Gross Revenue",
                        color: "var(--primary)",
                        strokeWidth: 2.5,
                      },
                    ]}
                    leftAxisFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Revenue by Plan Tier</CardTitle>
                <CardDescription>Proportional subscription distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {isEmpty ? (
                  <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
                    No tier breakdown available
                  </div>
                ) : (
                  <DonutDistributionChart
                    data={DISTRIBUTION_DATA}
                    height={300}
                    innerRadius={65}
                    outerRadius={95}
                    centerLabel="Total MRR"
                    centerValue="$103k"
                    valueFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Cockpit Row: Horizontal Top Rankings + Radial Gauges */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Microservice Request Volume (Top 5)
                </CardTitle>
                <CardDescription>Processed queries per minute across active mesh</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <HorizontalBarChart
                  data={HORIZONTAL_RANKINGS}
                  height={240}
                  valueFormatter={(v) => `${(v / 1000).toFixed(1)}k req/m`}
                />
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Infrastructure Health Gauges
                </CardTitle>
                <CardDescription>Cluster SLA, Memory footprint, and SSD I/O</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-around gap-4 pt-2 sm:flex-row">
                <div className="flex flex-col items-center">
                  <RadialGaugeChart
                    value={99.9}
                    max={100}
                    height={180}
                    theme="chart-2"
                    label="Uptime SLA"
                    unit="%"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <RadialGaugeChart
                    value={76}
                    max={100}
                    height={180}
                    theme="chart-3"
                    label="Memory Quota"
                    unit="%"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <RadialGaugeChart
                    value={42}
                    max={100}
                    height={180}
                    theme="primary"
                    label="Disk IOPS"
                    unit="%"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: CARDS MATRIX (ALL COMPONENT VARIANTS)         */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="cards" className="mt-6 space-y-6">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              1. Standard StatCards with Sparklines & Themes
            </h2>
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
              trend={{
                value: 0.08,
                direction: "down",
                label: "-0.08% improvement",
              }}
              sparklineData={[1.2, 0.9, 0.7, 0.5, 0.3, 0.1, 0.04]}
              theme="destructive"
            />
          </div>

          <div className="pt-4">
            <h2 className="text-foreground text-lg font-semibold">
              2. ProgressStatCard (Goal Pacing & Theme Accents)
            </h2>
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
            <h2 className="text-foreground text-lg font-semibold">
              3. MultiMetric & Live Streaming Stat Cards
            </h2>
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
                {
                  label: "CPU 16 Cores",
                  value: "34%",
                  trend: { value: 5.2, direction: "down" },
                },
                {
                  label: "RAM 64GB",
                  value: "52%",
                  trend: { value: 2.1, direction: "up" },
                },
                {
                  label: "Disk NVMe",
                  value: "68%",
                  trend: { value: 0.4, direction: "up" },
                },
              ]}
            />

            <MultiMetricStatCard
              title="Marketing Attribution Funnel"
              primaryValue="4.18%"
              primaryLabel="Avg Conversion"
              suffix=" CVR"
              icon={BarChart3}
              metrics={[
                {
                  label: "Ad Impressions",
                  value: "480k",
                  trend: { value: 18.2, direction: "up" },
                },
                {
                  label: "Click-Through",
                  value: "3.4%",
                  trend: { value: 0.8, direction: "up" },
                },
                {
                  label: "Activated",
                  value: "1,240",
                  trend: { value: 9.6, direction: "up" },
                },
              ]}
            />

            <LiveStatCard
              title="Real-Time Event Stream"
              value={liveTicker.value}
              suffix=" events/sec"
              icon={Activity}
              status={liveTicker.status}
              statusText={liveTicker.isRunning ? "LIVE WEBSOCKET" : "PAUSED"}
              lastUpdated="Just now"
              sparklineData={liveTicker.buffer}
              pulse={liveTicker.isRunning}
              description="Sub-millisecond reactive event pipe buffer with dynamic sparkline"
            />
          </div>

          {/* Section 4: Standalone High-Performance Sparkline Micro-Charts */}
          <div className="pt-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  4. Standalone Micro-Charts (Zero-Dependency SVG Sparklines)
                </h2>
                <p className="text-muted-foreground text-xs">
                  Ultra-lightweight Bezier smoothing with coordinate precision rounding and
                  sub-millisecond render budget.
                </p>
              </div>
              <Badge variant="outline" className="w-fit font-mono text-[11px]">
                Sparkline Engine
              </Badge>
            </div>
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Semantic Theme Palettes & Style Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Embeddable inside tables, headers, dense KPI grids, or standalone micro-cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase">
                  Area Gradient Smoothing
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {SPARKLINE_AREA_ITEMS.map((item) => (
                    <div
                      key={item.theme}
                      className="border-border/50 bg-card/60 flex flex-col justify-between space-y-2 rounded-xl border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-xs font-medium">{item.name}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">Area</span>
                      </div>
                      <div className="h-10 w-full">
                        <Sparkline
                          data={item.data}
                          theme={item.theme}
                          type="area"
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase">
                  Categorical Bar Histograms
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {SPARKLINE_BAR_ITEMS.map((item) => (
                    <div
                      key={item.theme}
                      className="border-border/50 bg-card/60 flex flex-col justify-between space-y-2 rounded-xl border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-xs font-medium">{item.name}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">Bar</span>
                      </div>
                      <div className="h-10 w-full">
                        <Sparkline
                          data={item.data}
                          theme={item.theme}
                          type="bar"
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Density & Sparkline Layout Matrix */}
          <div className="pt-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  5. Density Scaling & Anti-Truncation Sparkline Layouts
                </h2>
                <p className="text-muted-foreground text-xs">
                  Interactive density control (compact, default, comfortable) and bottom-docked
                  sparkline to guarantee 0 text overflow in 4-column grids.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Density Switcher */}
                <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
                  {(["compact", "default", "comfortable"] as const).map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant={cardDensity === d ? "secondary" : "ghost"}
                      className="h-7 text-xs capitalize"
                      onClick={() => setCardDensity(d)}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
                {/* Layout Switcher */}
                <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
                  {(["inline", "bottom"] as const).map((l) => (
                    <Button
                      key={l}
                      size="sm"
                      variant={cardSparklineLayout === l ? "secondary" : "ghost"}
                      className="h-7 text-xs capitalize"
                      onClick={() => setCardSparklineLayout(l)}
                    >
                      {l === "bottom" ? "Bottom Sparkline" : "Inline Sparkline"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <StatsGrid columns={4} density={cardDensity} sparklineLayout={cardSparklineLayout}>
            <StatCard
              title="平台有效订单总量"
              value="128,450"
              icon={ShoppingCart}
              theme="primary"
              trend={{ value: "+14.2%", direction: "up", label: "较上周同期" }}
              sparklineData={[20, 24, 28, 26, 32, 38, 42, 49, 58, 65]}
              description="全渠道支付成功的有效订单汇总"
            />
            <StatCard
              title="待发货与履约中"
              value={342}
              icon={Clock}
              theme="chart-3"
              trend={{
                value: "需加急",
                direction: "neutral",
                label: "待拣货出库",
              }}
              sparklineData={[12, 14, 18, 17, 21, 24, 25]}
              description="已分配到区域云仓的待拣选订单"
            />
            <StatCard
              title="妥投履约达成率"
              value="98.6%"
              icon={CheckCircle2}
              theme="chart-2"
              trend={{
                value: "98.6%",
                direction: "up",
                label: "SLA履约承诺达成率",
              }}
              sparklineData={[92, 94, 95, 96, 97, 98, 99]}
              description="48小时妥投承诺履约率"
            />
            <StatCard
              title="平均客单价 (AOV)"
              value={86.5}
              prefix="$"
              icon={DollarSign}
              theme="chart-4"
              trend={{ value: "+8.4%", direction: "up", label: "较上季度平均" }}
              sparklineData={[68, 72, 70, 78, 82, 85, 86.5]}
              description="活跃客户每单平均结算金额"
            />
          </StatsGrid>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: TRENDS (AREA, LINE, COMPOSED, BAR)            */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="trends" className="mt-6 space-y-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                Time-Series Visualization Gallery
              </h2>
              <p className="text-muted-foreground text-xs">
                Smooth gradients, dual Y-axis support, and memoized tooltips.
              </p>
            </div>
            <div className="bg-muted/30 flex w-fit items-center gap-1 rounded-md border p-1">
              {TIME_RANGES.map((tr) => (
                <Button
                  key={tr}
                  size="sm"
                  variant={timeRange === tr ? "default" : "ghost"}
                  className="h-6 px-2.5 text-xs uppercase"
                  onClick={() => handleTimeRangeChange(tr)}
                >
                  {tr}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Area Chart */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Area Gradient Chart</CardTitle>
                <CardDescription>Single or multi-area volumetric trend</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <AreaTrendChart
                  data={currentTrendData}
                  dataKey="revenue"
                  xAxisKey="label"
                  height={260}
                  theme="primary"
                  valueFormatter={(v) => `$${v.toLocaleString()}`}
                />
              </CardContent>
            </Card>

            {/* Multi-Line Trend Chart */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Multi-Series Line Trend</CardTitle>
                <CardDescription>Active user growth vs projected trajectory</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <LineTrendChart
                  data={currentTrendData}
                  xAxisKey="label"
                  height={260}
                  series={[
                    {
                      dataKey: "users",
                      name: "Active Users",
                      color: "var(--chart-1)",
                      strokeWidth: 2,
                    },
                    {
                      dataKey: "revenue",
                      name: "Invoiced ARR",
                      color: "var(--chart-2)",
                      strokeWidth: 2,
                      strokeDasharray: "4 4",
                    },
                  ]}
                  valueFormatter={(v) => v.toLocaleString()}
                />
              </CardContent>
            </Card>

            {/* Composed Chart */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Composed Bar + Line Combination
                </CardTitle>
                <CardDescription>Cost columns with revenue overlay line</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ComposedTrendChart
                  data={currentTrendData}
                  xAxisKey="label"
                  height={260}
                  bars={[
                    {
                      dataKey: "cost",
                      name: "Monthly Outflow",
                      color: "var(--chart-3)",
                    },
                  ]}
                  lines={[
                    {
                      dataKey: "revenue",
                      name: "Gross Inflow",
                      color: "var(--chart-1)",
                      strokeWidth: 2.5,
                    },
                  ]}
                  leftAxisFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
              </CardContent>
            </Card>

            {/* Bar Trend Chart */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Comparative Bar Trend Chart
                </CardTitle>
                <CardDescription>Metric comparison by period</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <BarTrendChart
                  data={currentTrendData}
                  dataKey="revenue"
                  xAxisKey="label"
                  secondaryDataKey="cost"
                  height={260}
                  theme="primary"
                  valueFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: DISTRIBUTION & MULTI-DIMENSIONAL             */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="distribution" className="mt-6 space-y-6">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Distribution, Gauges & Multi-Dimensional Radar
            </h2>
            <p className="text-muted-foreground text-xs">
              Visualizing composition proportions, goal completion, and holistic radar scorecards.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Donut Chart */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Plan Proportions</CardTitle>
                <CardDescription>Donut distribution with custom center</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <DonutDistributionChart
                  data={DISTRIBUTION_DATA}
                  height={280}
                  innerRadius={60}
                  outerRadius={88}
                  valueFormatter={(v) => `$${v.toLocaleString()}`}
                />
              </CardContent>
            </Card>

            {/* Radar Metric Chart */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">System Architecture Radar</CardTitle>
                <CardDescription>Multi-axis benchmark assessment</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <RadarMetricChart
                  data={RADAR_METRICS}
                  height={280}
                  series={[
                    {
                      dataKey: "score",
                      name: "Quality Index",
                      color: "var(--primary)",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Radial Gauge */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Radial Gauge Meters</CardTitle>
                <CardDescription>Single-metric speedometer view</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-2 pt-2">
                <RadialGaugeChart
                  value={87.4}
                  max={100}
                  height={210}
                  theme="primary"
                  label="Overall Score"
                  unit="%"
                />
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Passed 48/52 quality gates
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Horizontal Ranking Bar Full Width */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                API Endpoints Performance Ranking (Requests per Minute)
              </CardTitle>
              <CardDescription>
                Horizontal bar with percentage scale and inline legends
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <HorizontalBarChart
                data={HORIZONTAL_RANKINGS}
                height={260}
                valueFormatter={(v) => `${v.toLocaleString()} calls`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 5: STATE LAB (LOADING, EMPTY, ERROR, INTERACTION) */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="states" className="mt-6 space-y-6">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              State Simulation & Resilience Testing
            </h2>
            <p className="text-muted-foreground text-xs">
              Verify how stats components behave across various network and lifecycle conditions.
            </p>
          </div>

          <div className="bg-muted/20 flex items-center gap-2 rounded-lg border p-3">
            <span className="text-foreground mr-2 text-xs font-semibold">
              Trigger Current State:
            </span>
            {DEMO_STATES.map((st) => (
              <Button
                key={st}
                size="sm"
                variant={demoState === st ? "default" : "outline"}
                className="h-7 text-xs capitalize"
                onClick={() => handleDemoStateChange(st)}
              >
                {st}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Loading Skeleton State"
              value={32800}
              prefix="$"
              isLoading={isLoading}
              theme={isError ? "destructive" : "primary"}
              trend={{ value: 12.4, direction: "up" }}
              sparklineData={[10, 20, 15, 25, 30]}
            />

            <ProgressStatCard
              title="Pacing Goal State"
              value={isLoading ? 0 : 64}
              targetValue={100}
              suffix="%"
              progress={isLoading ? 0 : 64}
              isLoading={isLoading}
              theme="chart-3"
              pacingLabel="Review in 3 days"
            />

            <MultiMetricStatCard
              title="MultiMetric State"
              primaryValue={isLoading ? 0 : "Cluster A"}
              isLoading={isLoading}
              metrics={[
                { label: "Pods", value: isLoading ? "-" : "28/30" },
                { label: "Restarts", value: isLoading ? "-" : "0" },
                { label: "Status", value: isLoading ? "-" : "Ready" },
              ]}
            />

            <LiveStatCard
              title="Live Stream Pulsing"
              value={isLoading ? 0 : liveTicker.value}
              isLoading={isLoading}
              suffix=" req/s"
              status={isError ? "error" : "online"}
              statusText={isError ? "Degraded" : "Nominal"}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StatsShowcasePage;
