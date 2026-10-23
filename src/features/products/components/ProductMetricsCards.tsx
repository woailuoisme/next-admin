import { AlertTriangle, CheckCircle2, DollarSign, Package } from "lucide-react";

import { StatCard, StatsGrid } from "@/components/stats";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("products");
  return (
    <StatsGrid columns={4} isLoading={isLoading}>
      <StatCard
        title={t("metric_total_title")}
        value={stats.total}
        icon={Package}
        theme="chart-4"
        description={t("metric_total_desc")}
        trend={{
          value: "+4.5%",
          direction: "up",
          label: t("metric_total_trend"),
        }}
        sparklineData={stats.sparklines?.totalSku}
      />
      <StatCard
        title={t("metric_active_title")}
        value={stats.activeCount}
        icon={CheckCircle2}
        theme="chart-2"
        description={t("metric_active_desc")}
        trend={{
          value: "98.2%",
          direction: "neutral",
          label: t("metric_active_trend"),
        }}
        sparklineData={stats.sparklines?.activeSku}
      />
      <StatCard
        title={t("metric_low_stock_title")}
        value={stats.lowStockCount}
        icon={AlertTriangle}
        theme="chart-3"
        description={t("metric_low_stock_desc")}
        trend={{
          value: stats.lowStockCount > 0 ? t("metric_low_stock_need_restock") : t("metric_low_stock_normal"),
          direction: stats.lowStockCount > 0 ? "down" : "neutral",
          isPositiveGood: false,
        }}
        sparklineData={stats.sparklines?.lowStock}
        sparklineType="bar"
      />
      <StatCard
        title={t("metric_avg_price_title")}
        value={stats.avgPrice.toFixed(2)}
        prefix="$"
        icon={DollarSign}
        theme="chart-1"
        description={t("metric_avg_price_desc")}
        trend={{
          value: "+1.8%",
          direction: "up",
          label: t("metric_avg_price_trend"),
        }}
        sparklineData={stats.sparklines?.avgPrice}
      />
    </StatsGrid>
  );
}
