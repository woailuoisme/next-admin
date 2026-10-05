import { useMemo, useState } from "react";

import { AreaTrendChart, ChartCard } from "@/components/chart";

import type { MonthlyTrendPoint } from "../types";

interface RevenueChartProps {
  data?: MonthlyTrendPoint[];
  isLoading?: boolean;
}

const REVENUE_PERIODS = [
  { label: "7天", value: "7D" },
  { label: "30天", value: "30D" },
  { label: "12月", value: "12M" },
];

const formatRevenueTooltip = (val: number) => `$${val.toLocaleString()}`;

export function RevenueChart({ data = [], isLoading = false }: RevenueChartProps) {
  const [activePeriod, setActivePeriod] = useState("12M");

  // Map MonthlyTrendPoint data to AreaTrendChart data format
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        label: item.month,
        value: item.revenue,
        secondaryValue: item.orders * 100, // normalized scale if needed
      })),
    [data],
  );

  return (
    <ChartCard
      title="营收走势 (Revenue Trajectory)"
      description="全平台近 12 个月度总经营入账及销售波动分析"
      periods={REVENUE_PERIODS}
      activePeriod={activePeriod}
      onPeriodChange={setActivePeriod}
      height={300}
      isLoading={isLoading}
      isEmpty={!data?.length}
      className="col-span-full lg:col-span-4"
    >
      <AreaTrendChart
        data={chartData}
        theme="chart-2"
        dataKey="value"
        xAxisKey="label"
        valueFormatter={formatRevenueTooltip}
        height={300}
      />
    </ChartCard>
  );
}
