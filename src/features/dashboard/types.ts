import type { z } from "zod";

import type { Order } from "@/features/orders";
import type { Product } from "@/features/products";

import type { dashboardSearchSchema, dashboardTimeRangeSchema } from "./schemas";

export type DashboardTimeRange = z.infer<typeof dashboardTimeRangeSchema>;
export type DashboardSearchParams = z.infer<typeof dashboardSearchSchema>;

export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  customersGrowth: number;
}

export interface MonthlyTrendPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistributionPoint {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardSparklines {
  revenue: number[];
  orders: number[];
  products: number[];
  customers: number[];
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  monthlyTrends: MonthlyTrendPoint[];
  categoryDistribution: CategoryDistributionPoint[];
  sparklines: DashboardSparklines;
  recentOrders: Order[];
  lowStockProducts: Product[];
}
