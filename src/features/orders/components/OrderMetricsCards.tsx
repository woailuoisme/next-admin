import { Clock, DollarSign, PackageCheck, ShoppingCart } from "lucide-react";

import { type SparklineLayout, StatCard, type StatDensity, StatsGrid } from "@/components/stats";

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
  return (
    <StatsGrid columns={4} isLoading={isLoading} density={density} sparklineLayout={sparklineLayout}>
      <StatCard
        title="平台总订单数"
        value={stats.total.toLocaleString()}
        icon={ShoppingCart}
        theme="chart-1"
        description="全渠道支付成功的有效订单汇总"
        trend={{
          value: "+12.4%",
          direction: "up",
          label: "较上周",
        }}
        sparklineData={stats.sparklines?.totalOrders}
        sparklineType="bar"
      />
      <StatCard
        title="待发货 / 履约中"
        value={stats.pendingCount}
        icon={Clock}
        theme="chart-3"
        description="处于 Pending 或 Processing 状态需仓库打包出库的订单"
        trend={{
          value: stats.pendingCount > 0 ? "需处理" : "已清空",
          direction: stats.pendingCount > 0 ? "neutral" : "up",
          isPositiveGood: false,
        }}
        sparklineData={stats.sparklines?.pending}
      />
      <StatCard
        title="已交付完成"
        value={stats.deliveredCount}
        icon={PackageCheck}
        theme="chart-2"
        description="已妥投收件人签收并结算的完成订单"
        trend={{
          value: "95.6%",
          direction: "up",
          label: "履约达成率",
        }}
        sparklineData={stats.sparklines?.delivered}
      />
      <StatCard
        title="平均客单价 (AOV)"
        value={stats.avgOrderValue.toFixed(2)}
        prefix="$"
        icon={DollarSign}
        theme="chart-4"
        description="每笔有效交易的平均消费金额"
        trend={{
          value: "+5.2%",
          direction: "up",
          label: "较上季",
        }}
        sparklineData={stats.sparklines?.avgOrderValue}
      />
    </StatsGrid>
  );
}
