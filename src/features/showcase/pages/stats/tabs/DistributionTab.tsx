import { CheckCircle2 } from "lucide-react";

import {
  DonutDistributionChart,
  HorizontalBarChart,
  RadarMetricChart,
  RadialGaugeChart,
} from "@/components/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DISTRIBUTION_DATA, HORIZONTAL_RANKINGS, RADAR_METRICS } from "../constants";

export function DistributionTab() {
  return (
    <div className="space-y-6">
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
          <CardDescription>Horizontal bar with percentage scale and inline legends</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <HorizontalBarChart
            data={HORIZONTAL_RANKINGS}
            height={260}
            valueFormatter={(v) => `${v.toLocaleString()} calls`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
