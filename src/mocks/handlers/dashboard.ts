import { groupBy, orderBy, round, sumBy } from "es-toolkit";
import { http } from "msw";

import type { Order } from "@/features/orders";
import type { Product } from "@/features/products";
import type { Customer } from "@/features/users";

import { db, resetDb } from "../db";
import { checkChaosError, jsonOk, simulateNetwork } from "../middleware";

const CATEGORY_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"] as const;

export const dashboardHandlers = [
  http.get("/v1/dashboard/summary", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "30d";

    const orders = db.order.getAll() as unknown as Order[];
    const products = db.product.getAll() as unknown as Product[];
    const customers = db.customer.getAll() as unknown as Customer[];

    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = round(
      sumBy(validOrders, (o) => o.total),
      2,
    );
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;

    let monthlyTrends = [
      { month: "Oct", revenue: 14200, orders: 48 },
      { month: "Nov", revenue: 18500, orders: 62 },
      { month: "Dec", revenue: 29400, orders: 98 },
      { month: "Jan", revenue: 21800, orders: 74 },
      { month: "Feb", revenue: 24500, orders: 81 },
      { month: "Mar", revenue: 26900, orders: 92 },
      { month: "Apr", revenue: 31200, orders: 104 },
      { month: "May", revenue: 33800, orders: 115 },
      { month: "Jun", revenue: 38900, orders: 130 },
      { month: "Jul", revenue: 41200, orders: 142 },
      { month: "Aug", revenue: 44600, orders: 155 },
      { month: "Sep", revenue: totalRevenue + 12000, orders: totalOrders + 40 },
    ];

    let multiplier = 1;
    let growthMultiplier = 1;
    if (range === "7d") {
      monthlyTrends = monthlyTrends.slice(-4);
      multiplier = 0.28;
      growthMultiplier = 1.35;
    } else if (range === "90d") {
      monthlyTrends = monthlyTrends.slice(-6);
      multiplier = 2.75;
      growthMultiplier = 0.85;
    }

    const recentOrders = orderBy(orders, [(o) => o.createdAt], ["desc"]).slice(0, 5);

    const lowStockProducts = products.filter((p) => p.stock <= 10);

    const categories = db.category.getAll() as unknown as {
      id: string;
      name: string;
    }[];

    const productCategoryMap = new Map(products.map((p) => [p.id, p.categoryId]));
    const productsByCategory = groupBy(products, (p) => p.categoryId);

    const categoryRevenueMap = new Map<string, number>();
    for (const o of validOrders) {
      for (const item of o.items || []) {
        const catId = productCategoryMap.get(item.productId);
        if (catId) {
          const current = categoryRevenueMap.get(catId) || 0;
          categoryRevenueMap.set(catId, current + item.price * item.quantity);
        }
      }
    }

    const categoryDistribution = categories.map((cat, idx) => {
      const orderRev = categoryRevenueMap.get(cat.id) || 0;
      const catProducts = productsByCategory[cat.id] ?? [];
      const prodStockVal = sumBy(catProducts, (p) => p.price * Math.max(p.stock, 5));
      const rawVal = orderRev > 0 ? orderRev : round(prodStockVal * 0.4, 2);
      return {
        name: cat.name,
        value: Math.max(100, round(rawVal * multiplier, 2)),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      };
    });

    const revenueSparkline = monthlyTrends.map((t) => t.revenue);
    const ordersSparkline = monthlyTrends.map((t) => t.orders);
    const trendLen = monthlyTrends.length;
    const productsSparkline = monthlyTrends.map((_, i) =>
      Math.max(10, Math.round(totalProducts * (0.75 + (0.25 * (i + 1)) / trendLen))),
    );
    const customersSparkline = monthlyTrends.map((_, i) =>
      Math.max(10, Math.round(totalCustomers * (0.6 + (0.4 * (i + 1)) / trendLen))),
    );

    const summary = {
      metrics: {
        totalRevenue: round(totalRevenue * multiplier, 2),
        revenueGrowth: round(14.8 * growthMultiplier, 1),
        totalOrders: Math.round(totalOrders * multiplier),
        ordersGrowth: round(8.4 * growthMultiplier, 1),
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalCustomers: Math.round(totalCustomers * multiplier),
        customersGrowth: round(12.3 * growthMultiplier, 1),
      },
      monthlyTrends,
      categoryDistribution,
      sparklines: {
        revenue: revenueSparkline,
        orders: ordersSparkline,
        products: productsSparkline,
        customers: customersSparkline,
      },
      recentOrders,
      lowStockProducts,
    };

    return jsonOk(summary);
  }),

  http.post("/v1/dashboard/reset", async ({ request }) => {
    await simulateNetwork(request);
    await resetDb();
    return jsonOk({
      success: true,
      message: "Database reset to default seed data",
    });
  }),
];
