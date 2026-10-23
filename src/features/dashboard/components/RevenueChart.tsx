import { useMemo, useState } from "react";

import { ChartCard, LazyAreaTrendChart } from "@/components/chart";

import type { MonthlyTrendPoint } from "../types";
import { useTranslations } from "next-intl";

interface RevenueChartProps {
  data?: MonthlyTrendPoint[];
  isLoading?: boolean;
}

const formatRevenueTooltip = (val: number) => `$${new Intl.NumberFormat().format(val)}`;

export function RevenueChart({ data = [], isLoading = false }: RevenueChartProps) {
  const t = useTranslations("dashboard");
  const [activePeriod, setActivePeriod] = useState("12M");

  const revenuePeriods = useMemo(
    () => [
      { label: t("period_7d"), value: "7D" },
      { label: t("period_30d"), value: "30D" },
      { label: t("period_12m"), value: "12M" },
    ],
    [t],
  );

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
      title={t("revenue_chart_title")}
      description={t("revenue_chart_desc")}
      periods={revenuePeriods}
      activePeriod={activePeriod}
      onPeriodChange={setActivePeriod}
      height={300}
      isLoading={isLoading}
      isEmpty={!data?.length}
      className="col-span-full lg:col-span-4"
    >
      <LazyAreaTrendChart
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
