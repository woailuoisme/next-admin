import { DollarSign, Server, TrendingUp, Zap } from "lucide-react";

import { ComposedTrendChart, DonutDistributionChart, HorizontalBarChart, RadialGaugeChart } from "@/components/chart";
import { LiveStatCard, MultiMetricStatCard, ProgressStatCard, StatCard, type useLiveTicker } from "@/components/stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DISTRIBUTION_DATA, HORIZONTAL_RANKINGS, TIME_RANGES } from "../constants";
import type { DemoState, RawTrendItem, TimeRange } from "../types";

export interface OverviewTabProps {
  demoState: DemoState;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  liveTicker: ReturnType<typeof useLiveTicker>;
  timeRange: TimeRange;
  onTimeRangeChange: (tr: TimeRange) => void;
  currentTrendData: RawTrendItem[];
}

export function OverviewTab({
  demoState,
  isLoading,
  isError,
  isEmpty,
  liveTicker,
  timeRange,
  onTimeRangeChange,
  currentTrendData,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Top KPI 4-Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (ARR)"
          value={demoState === "empty" ? 0 : 849200}
          prefix="$"
          icon={DollarSign}
          trend={{ value: 18.4, direction: "up", label: "vs last quarter" }}
          sparklineData={demoState === "empty" ? undefined : [20, 24, 28, 26, 32, 38, 42, 49, 58, 65]}
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
              <CardTitle className="text-base font-semibold">Financial Inflow vs Operation Expense</CardTitle>
              <CardDescription>Multi-axis composed projection (Bars = Cost, Line = Revenue)</CardDescription>
            </div>
            <div className="bg-muted/30 flex items-center gap-1 rounded-md border p-1">
              {TIME_RANGES.map((tr) => (
                <Button
                  key={tr}
                  size="sm"
                  variant={timeRange === tr ? "default" : "ghost"}
                  className="h-6 px-2 text-xs uppercase"
                  onClick={() => onTimeRangeChange(tr)}
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
            <CardTitle className="text-base font-semibold">Microservice Request Volume (Top 5)</CardTitle>
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
            <CardTitle className="text-base font-semibold">Infrastructure Health Gauges</CardTitle>
            <CardDescription>Cluster SLA, Memory footprint, and SSD I/O</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-around gap-4 pt-2 sm:flex-row">
            <div className="flex flex-col items-center">
              <RadialGaugeChart value={99.9} max={100} height={180} theme="chart-2" label="Uptime SLA" unit="%" />
            </div>
            <div className="flex flex-col items-center">
              <RadialGaugeChart value={76} max={100} height={180} theme="chart-3" label="Memory Quota" unit="%" />
            </div>
            <div className="flex flex-col items-center">
              <RadialGaugeChart value={42} max={100} height={180} theme="primary" label="Disk IOPS" unit="%" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
