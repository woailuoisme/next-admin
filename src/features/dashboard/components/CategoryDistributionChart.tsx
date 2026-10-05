import { ChartCard, DonutDistributionChart } from "@/components/chart";

import type { CategoryDistributionPoint } from "../types";

interface CategoryDistributionChartProps {
  data?: CategoryDistributionPoint[];
  isLoading?: boolean;
  className?: string;
}

const EMPTY_DISTRIBUTION_DATA: CategoryDistributionPoint[] = [];

const formatCategoryShare = (val: number) => `$${(val / 1000).toFixed(1)}k`;

export function CategoryDistributionChart({
  data,
  isLoading = false,
  className,
}: CategoryDistributionChartProps) {
  const chartData = data ?? EMPTY_DISTRIBUTION_DATA;

  return (
    <ChartCard
      title="品类营收结构 (Category Share)"
      description="按商品一级类目划分的贡献营收比重"
      className={className}
      height={260}
      isLoading={isLoading}
      isEmpty={!isLoading && chartData.length === 0}
      emptyMessage="暂无品类销售数据"
    >
      <DonutDistributionChart
        data={chartData}
        centerLabel="类目总额"
        valueFormatter={formatCategoryShare}
        height={240}
      />
    </ChartCard>
  );
}
