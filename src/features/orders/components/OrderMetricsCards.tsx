import { Clock, DollarSign, PackageCheck, ShoppingCart } from "lucide-react";

import { type SparklineLayout, StatCard, type StatDensity, StatsGrid } from "@/components/stats";
import { useTranslations } from "next-intl";

export interface OrderMetricsSummary {
  total: number;
  pendingCount: number;
  deliveredCount: number;
  avgOrderValue: number;
  sparklines?: {
    totalOrders?: number[];
    pending?: number[];
    delivered?: number[];
    avgOrderValue?: number[];
  };
}

export interface OrderMetricsCardsProps {
  stats: OrderMetricsSummary;
  isLoading?: boolean;
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
}

export function OrderMetricsCards({
  stats,
  isLoading = false,
  density,
  sparklineLayout = "inline",
}: OrderMetricsCardsProps) {
  const t = useTranslations("orders");

  return (
    <StatsGrid columns={4} isLoading={isLoading} density={density} sparklineLayout={sparklineLayout}>
      <StatCard
        title={t("metric_total_title")}
        value={stats.total.toLocaleString()}
        icon={ShoppingCart}
        theme="chart-1"
        description={t("metric_total_desc")}
        trend={{
          value: "+12.4%",
          direction: "up",
          label: t("metric_total_trend"),
        }}
        sparklineData={stats.sparklines?.totalOrders}
        sparklineType="bar"
      />
      <StatCard
        title={t("metric_pending_title")}
        value={stats.pendingCount}
        icon={Clock}
        theme="chart-3"
        description={t("metric_pending_desc")}
        trend={{
          value: stats.pendingCount > 0 ? t("metric_pending_need_action") : t("metric_pending_cleared"),
          direction: stats.pendingCount > 0 ? "neutral" : "up",
          isPositiveGood: false,
        }}
        sparklineData={stats.sparklines?.pending}
      />
      <StatCard
        title={t("metric_delivered_title")}
        value={stats.deliveredCount}
        icon={PackageCheck}
        theme="chart-2"
        description={t("metric_delivered_desc")}
        trend={{
          value: "95.6%",
          direction: "up",
          label: t("metric_delivered_trend"),
        }}
        sparklineData={stats.sparklines?.delivered}
      />
      <StatCard
        title={t("metric_aov_title")}
        value={stats.avgOrderValue.toFixed(2)}
        prefix="$"
        icon={DollarSign}
        theme="chart-4"
        description={t("metric_aov_desc")}
        trend={{
          value: "+5.2%",
          direction: "up",
          label: t("metric_aov_trend"),
        }}
        sparklineData={stats.sparklines?.avgOrderValue}
      />
    </StatsGrid>
  );
}
