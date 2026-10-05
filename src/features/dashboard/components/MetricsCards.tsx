import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useMemo } from "react";

import { StatCard, StatsGrid } from "@/components/stats";

import type { DashboardMetrics, DashboardSparklines, MonthlyTrendPoint } from "../types";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  monthlyTrends?: MonthlyTrendPoint[];
  sparklines?: DashboardSparklines;
  isLoading?: boolean;
}

const EMPTY_NUMBER_ARRAY: number[] = [];

const currencyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat(undefined);

export function MetricsCards({
  metrics,
  monthlyTrends,
  sparklines,
  isLoading = false,
}: MetricsCardsProps) {
  if (isLoading || !metrics) {
    return <StatsGrid columns={4} isLoading />;
  }
  const sparkRevenue = sparklines?.revenue;
  const sparkOrders = sparklines?.orders;

  const revenueSparkline = useMemo(
    () =>
      sparkRevenue?.length
        ? sparkRevenue
        : (monthlyTrends?.map((t) => t.revenue) ?? EMPTY_NUMBER_ARRAY),
    [sparkRevenue, monthlyTrends],
  );

  const ordersSparkline = useMemo(
    () =>
      sparkOrders?.length
        ? sparkOrders
        : (monthlyTrends?.map((t) => t.orders) ?? EMPTY_NUMBER_ARRAY),
    [sparkOrders, monthlyTrends],
  );

  const productsSparkline = sparklines?.products ?? EMPTY_NUMBER_ARRAY;
  const customersSparkline = sparklines?.customers ?? EMPTY_NUMBER_ARRAY;

  return (
    <StatsGrid columns={4} isLoading={isLoading}>
      {/* 1. Total Revenue */}
      <StatCard
        title="总营收 (Revenue)"
        value={currencyFormatter.format(metrics.totalRevenue)}
        prefix="$"
        icon={DollarSign}
        theme="chart-2"
        description="过去 12 个月内所有已确认交易的总入账金额"
        trend={{
          value: `+${metrics.revenueGrowth}%`,
          direction: metrics.revenueGrowth >= 0 ? "up" : "down",
          label: "较上月",
          isPositiveGood: true,
        }}
        sparklineData={revenueSparkline}
        sparklineType="area"
      />

      {/* 2. Total Orders (with drilldown to /orders) */}
      <StatCard
        title="总订单量 (Orders)"
        value={integerFormatter.format(metrics.totalOrders)}
        icon={ShoppingCart}
        theme="chart-1"
        description="平台全渠道支付成功的有效订单总量，支持点击下钻查看明细"
        trend={{
          value: `+${metrics.ordersGrowth}%`,
          direction: metrics.ordersGrowth >= 0 ? "up" : "down",
          label: "较上月",
          isPositiveGood: true,
        }}
        sparklineData={ordersSparkline}
        sparklineType="bar"
        to="/orders"
      />

      {/* 3. Catalog Products (with drilldown to /products) */}
      <StatCard
        title="商品类目 (Products)"
        value={metrics.totalProducts}
        icon={Package}
        theme="chart-4"
        description="在线运营的有效 SKU 计数，点击查看商品目录"
        trend={{
          value: `${metrics.lowStockCount} 件库存偏低`,
          direction: metrics.lowStockCount > 0 ? "down" : "neutral",
          label: "预警",
          isPositiveGood: false,
        }}
        sparklineData={productsSparkline}
        to="/products"
      />

      {/* 4. Active Customers */}
      <StatCard
        title="活跃客户 (Customers)"
        value={integerFormatter.format(metrics.totalCustomers)}
        icon={Users}
        theme="chart-3"
        description="近 30 天内在系统中有浏览或下单交互的独立客户数"
        trend={{
          value: `+${metrics.customersGrowth ?? 8.2}%`,
          direction: "up",
          label: "较上月",
          isPositiveGood: true,
        }}
        sparklineData={customersSparkline}
        to="/users"
      />
    </StatsGrid>
  );
}
