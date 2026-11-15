import { AreaTrendChart } from "@/components/chart/area/AreaTrendChart";
import { BarTrendChart } from "@/components/chart/bar/BarTrendChart";
import { ComposedTrendChart } from "@/components/chart/composed/ComposedTrendChart";
import { LineTrendChart } from "@/components/chart/line/LineTrendChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { STATS_USD_FORMATTER, TIME_RANGES } from "../constants";
import type { RawTrendItem, TimeRange } from "../types";

const NUMBER_FORMATTER = (v: number) => v.toLocaleString();
const USD_THOUSANDS_FORMATTER = (v: number) => `$${(v / 1000).toFixed(0)}k`;

const STATS_LINE_SERIES = [
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
];

const STATS_COMPOSED_BARS = [
  {
    dataKey: "cost",
    name: "Monthly Outflow",
    color: "var(--chart-3)",
  },
];

const STATS_COMPOSED_LINES = [
  {
    dataKey: "revenue",
    name: "Gross Inflow",
    color: "var(--chart-1)",
    strokeWidth: 2.5,
  },
];

export interface TrendsTabProps {
  timeRange: TimeRange;
  onTimeRangeChange: (tr: TimeRange) => void;
  currentTrendData: RawTrendItem[];
}

export function TrendsTab({ timeRange, onTimeRangeChange, currentTrendData }: TrendsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Time-Series Visualization Gallery</h2>
          <p className="text-muted-foreground text-xs">Smooth gradients, dual Y-axis support, and memoized tooltips.</p>
        </div>
        <div className="bg-muted/30 flex w-fit items-center gap-1 rounded-md border p-1">
          {TIME_RANGES.map((tr) => (
            <Button
              key={tr}
              size="sm"
              variant={timeRange === tr ? "default" : "ghost"}
              className="h-6 px-2.5 text-xs uppercase"
              onClick={() => onTimeRangeChange(tr)}
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
              valueFormatter={STATS_USD_FORMATTER}
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
              series={STATS_LINE_SERIES}
              valueFormatter={NUMBER_FORMATTER}
            />
          </CardContent>
        </Card>

        {/* Composed Chart */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Composed Bar + Line Combination</CardTitle>
            <CardDescription>Cost columns with revenue overlay line</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ComposedTrendChart
              data={currentTrendData}
              xAxisKey="label"
              height={260}
              bars={STATS_COMPOSED_BARS}
              lines={STATS_COMPOSED_LINES}
              leftAxisFormatter={USD_THOUSANDS_FORMATTER}
            />
          </CardContent>
        </Card>

        {/* Bar Trend Chart */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Comparative Bar Trend Chart</CardTitle>
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
              valueFormatter={USD_THOUSANDS_FORMATTER}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
