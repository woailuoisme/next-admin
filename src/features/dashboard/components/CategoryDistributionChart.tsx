import { ChartCard, LazyDonutDistributionChart } from "@/components/chart";

import type { CategoryDistributionPoint } from "../types";
import { useTranslations } from "next-intl";

interface CategoryDistributionChartProps {
  data?: CategoryDistributionPoint[];
  isLoading?: boolean;
  className?: string;
}

const EMPTY_DISTRIBUTION_DATA: CategoryDistributionPoint[] = [];

const formatCategoryShare = (val: number) => `$${(val / 1000).toFixed(1)}k`;

export function CategoryDistributionChart({ data, isLoading = false, className }: CategoryDistributionChartProps) {
  const t = useTranslations("dashboard");
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
    >
      <LazyDonutDistributionChart
        data={chartData}
        centerLabel={t("category_center_label")}
        valueFormatter={formatCategoryShare}
        height={240}
      />
    </ChartCard>
  );
}
