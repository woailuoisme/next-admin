import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useMemo } from "react";

import { StatCard, StatsGrid } from "@/components/stats";

import type { DashboardMetrics, DashboardSparklines, MonthlyTrendPoint } from "../types";
import { useFormatter, useTranslations } from "next-intl";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  monthlyTrends?: MonthlyTrendPoint[];
  sparklines?: DashboardSparklines;
  isLoading?: boolean;
}

const EMPTY_NUMBER_ARRAY: number[] = [];

export function MetricsCards({ metrics, monthlyTrends, sparklines, isLoading = false }: MetricsCardsProps) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  // hooks 必须先于提前返回：本组件可能从 loading 骨架态原地切换到数据态
  const { revenueSparkline, ordersSparkline } = useMemo(() => {
    const fromTrends = (pick: (point: MonthlyTrendPoint) => number) => monthlyTrends?.map(pick) ?? EMPTY_NUMBER_ARRAY;
    return {
      revenueSparkline: sparklines?.revenue?.length ? sparklines.revenue : fromTrends((point) => point.revenue),
      ordersSparkline: sparklines?.orders?.length ? sparklines.orders : fromTrends((point) => point.orders),
    };
  }, [sparklines, monthlyTrends]);

  const productsSparkline = sparklines?.products ?? EMPTY_NUMBER_ARRAY;
  const customersSparkline = sparklines?.customers ?? EMPTY_NUMBER_ARRAY;

  if (isLoading || !metrics) {
    return <StatsGrid columns={4} isLoading />;
  }

  return (
    <StatsGrid columns={4} isLoading={isLoading}>
      {/* 1. Total Revenue */}
      <StatCard
        title={t("metric_revenue_title")}
        value={format.number(metrics.totalRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        prefix="$"
        icon={DollarSign}
        theme="chart-2"
        description={t("metric_revenue_desc")}
        trend={{
          value: `+${metrics.revenueGrowth}%`,
          direction: metrics.revenueGrowth >= 0 ? "up" : "down",
          label: t("metric_revenue_trend"),
          isPositiveGood: true,
        }}
        sparklineData={revenueSparkline}
        sparklineType="area"
      />

      {/* 2. Total Orders (with drilldown to /orders) */}
      <StatCard
        title={t("metric_orders_title")}
        value={format.number(metrics.totalOrders)}
        icon={ShoppingCart}
        theme="chart-1"
        description={t("metric_orders_desc")}
        trend={{
          value: `+${metrics.ordersGrowth}%`,
          direction: metrics.ordersGrowth >= 0 ? "up" : "down",
          label: t("metric_orders_trend"),
          isPositiveGood: true,
        }}
        sparklineData={ordersSparkline}
        sparklineType="bar"
        to="/orders"
      />

      {/* 3. Catalog Products (with drilldown to /products) */}
      <StatCard
        title={t("metric_products_title")}
        value={metrics.totalProducts}
        icon={Package}
        theme="chart-4"
        description={t("metric_products_desc")}
        trend={{
          value: t("metric_low_stock", { count: metrics.lowStockCount }),
          direction: metrics.lowStockCount > 0 ? "down" : "neutral",
          label: t("metric_alert_label"),
          isPositiveGood: false,
        }}
        sparklineData={productsSparkline}
        to="/products"
      />

      {/* 4. Active Customers */}
      <StatCard
        title={t("metric_customers_title")}
        value={format.number(metrics.totalCustomers)}
        icon={Users}
        theme="chart-3"
        description={t("metric_customers_desc")}
        trend={{
          value: `+${metrics.customersGrowth ?? 8.2}%`,
          direction: "up",
          label: t("metric_customers_trend"),
          isPositiveGood: true,
        }}
        sparklineData={customersSparkline}
        to="/users"
      />
    </StatsGrid>
  );
}
