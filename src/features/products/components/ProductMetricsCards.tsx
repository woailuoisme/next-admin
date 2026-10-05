import { AlertTriangle, CheckCircle2, DollarSign, Package } from "lucide-react";

import { StatCard, StatsGrid } from "@/components/stats";

export interface ProductMetricsSummary {
  total: number;
  activeCount: number;
  lowStockCount: number;
  avgPrice: number;
  sparklines?: {
    totalSku?: number[];
    activeSku?: number[];
    lowStock?: number[];
    avgPrice?: number[];
  };
}

export interface ProductMetricsCardsProps {
  stats: ProductMetricsSummary;
  isLoading?: boolean;
}

export function ProductMetricsCards({ stats, isLoading = false }: ProductMetricsCardsProps) {
  return (
    <StatsGrid columns={4} isLoading={isLoading}>
      <StatCard
        title="总商品 SKU"
        value={stats.total}
        icon={Package}
        theme="chart-4"
        description="系统录入的有效规格商品总数量"
        trend={{
          value: "+4.5%",
          direction: "up",
          label: "较上季",
        }}
        sparklineData={stats.sparklines?.totalSku}
      />
      <StatCard
        title="在架正常在售"
        value={stats.activeCount}
        icon={CheckCircle2}
        theme="chart-2"
        description="当前处于上架销售中的激活商品"
        trend={{
          value: "98.2%",
          direction: "neutral",
          label: "健康率",
        }}
        sparklineData={stats.sparklines?.activeSku}
      />
      <StatCard
        title="低库存预警"
        value={stats.lowStockCount}
        icon={AlertTriangle}
        theme="chart-3"
        description="库存余量不足或已断货需紧急补仓的商品"
        trend={{
          value: stats.lowStockCount > 0 ? "需补货" : "正常",
          direction: stats.lowStockCount > 0 ? "down" : "neutral",
          isPositiveGood: false,
        }}
        sparklineData={stats.sparklines?.lowStock}
        sparklineType="bar"
      />
      <StatCard
        title="SKU 平均单价"
        value={stats.avgPrice.toFixed(2)}
        prefix="$"
        icon={DollarSign}
        theme="chart-1"
        description="在售商品的平均定价基准"
        trend={{
          value: "+1.8%",
          direction: "up",
          label: "同比",
        }}
        sparklineData={stats.sparklines?.avgPrice}
      />
    </StatsGrid>
  );
}
