"use client";

import { useMemoizedFn } from "ahooks";
import { useFormatter, useTranslations } from "next-intl";

import { ChartCard, LazyDonutDistributionChart } from "@/components/chart";

import type { CategoryDistributionPoint } from "../types";

interface CategoryDistributionChartProps {
  data?: CategoryDistributionPoint[];
  isLoading?: boolean;
  className?: string;
}

const EMPTY_DISTRIBUTION_DATA: CategoryDistributionPoint[] = [];

export function CategoryDistributionChart({ data, isLoading = false, className }: CategoryDistributionChartProps) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const formatCategoryShare = useMemoizedFn((val: number) =>
    format.number(val, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }),
  );
  const chartData = data ?? EMPTY_DISTRIBUTION_DATA;

  return (
    <ChartCard
      title={t("category_chart_title")}
      description={t("category_chart_desc")}
      className={className}
      height={260}
      isLoading={isLoading}
      isEmpty={!isLoading && chartData.length === 0}
      emptyMessage={t("category_empty")}
      skeletonVariant="donut"
    >
      <LazyDonutDistributionChart
        data={chartData}
        centerLabel={t("category_center_label")}
        valueFormatter={formatCategoryShare}
      />
    </ChartCard>
  );
}
