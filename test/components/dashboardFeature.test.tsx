import { describe, expect, it, vi } from "vitest";

import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { MetricsCards } from "@/features/dashboard/components/MetricsCards";
import { RecentOrdersTable } from "@/features/dashboard/components/RecentOrdersTable";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import type { DashboardMetrics, DashboardSparklines, MonthlyTrendPoint } from "@/features/dashboard/types";
import type { Order } from "@/features/orders";
import { fireEvent, renderWithProviders, screen, within } from "test/test-utils";

const mockMetrics: DashboardMetrics = {
  totalRevenue: 128450.5,
  revenueGrowth: 15.2,
  totalOrders: 1420,
  ordersGrowth: 8.4,
  totalProducts: 360,
  lowStockCount: 4,
  totalCustomers: 2890,
  customersGrowth: 12.1,
};

const mockTrends: MonthlyTrendPoint[] = [
  { month: "1月", revenue: 84000, orders: 920 },
  { month: "2月", revenue: 96000, orders: 1100 },
];

const mockSparklines: DashboardSparklines = {
  revenue: [80, 85, 90, 95],
  orders: [10, 12, 14, 16],
  products: [350, 355, 360],
  customers: [2700, 2800, 2890],
};

const mockOrders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2026-001",
    customerId: "cust-1",
    customerName: "Alex Rivera",
    customerEmail: "alex@example.com",
    total: 350,
    subtotal: 350,
    tax: 0,
    shipping: 0,
    status: "delivered",
    items: [{ productId: "p1", productTitle: "Product A", price: 350, quantity: 1 }],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-2026-002",
    customerId: "cust-2",
    customerName: "Sarah Chen",
    customerEmail: "sarah@example.com",
    total: 120,
    subtotal: 120,
    tax: 0,
    shipping: 0,
    status: "pending",
    items: [{ productId: "p2", productTitle: "Product B", price: 120, quantity: 1 }],
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

describe("Dashboard Feature Tests", () => {
  it("renders MetricsCards with calculated trends and sparklines", () => {
    renderWithProviders(<MetricsCards metrics={mockMetrics} monthlyTrends={mockTrends} sparklines={mockSparklines} />);

    expect(screen.getByText("总营收 (Revenue)")).toBeInTheDocument();
    expect(screen.getByText("总订单量 (Orders)")).toBeInTheDocument();
    expect(screen.getByText("商品类目 (Products)")).toBeInTheDocument();
    expect(screen.getByText("活跃客户 (Customers)")).toBeInTheDocument();
  });

  it("formats negative growth without double sign and formats totalProducts", () => {
    renderWithProviders(
      <MetricsCards
        metrics={{
          ...mockMetrics,
          revenueGrowth: -5.2,
          ordersGrowth: -1.5,
          customersGrowth: -3,
          totalProducts: 1250,
        }}
        monthlyTrends={mockTrends}
        sparklines={mockSparklines}
      />,
    );

    expect(screen.getByText("-5.2%")).toBeInTheDocument();
    expect(screen.queryByText("+-5.2%")).not.toBeInTheDocument();
    expect(screen.getByText("-1.5%")).toBeInTheDocument();
    expect(screen.getByText("-3%")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("allows RevenueChart period tabs to switch active slice cleanly", () => {
    const eightMonths: MonthlyTrendPoint[] = Array.from({ length: 8 }, (_, idx) => ({
      month: `${idx + 1}月`,
      revenue: 50000 + idx * 5000,
      orders: 500 + idx * 50,
    }));

    renderWithProviders(<RevenueChart data={eightMonths} />);

    const tab7d = screen.getByRole("tab", { name: "7天" });
    const tab30d = screen.getByRole("tab", { name: "30天" });
    const tab12m = screen.getByRole("tab", { name: "12月" });

    expect(tab12m).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseDown(tab7d);
    expect(tab7d).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseDown(tab30d);
    expect(tab30d).toHaveAttribute("aria-selected", "true");
  });

  it("renders RecentOrdersTable with semantic status tokens", () => {
    renderWithProviders(<RecentOrdersTable orders={mockOrders} />);

    expect(screen.getByText("ORD-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("已妥投")).toBeInTheDocument();

    expect(screen.getByText("ORD-2026-002")).toBeInTheDocument();
    expect(screen.getByText("待审核")).toBeInTheDocument();
  });

  it("renders QuickActions navigation buttons", () => {
    renderWithProviders(<QuickActions />);

    expect(screen.getByText("商品目录")).toBeInTheDocument();
    expect(screen.getByText("订单处理")).toBeInTheDocument();
    expect(screen.getByText("分类管理")).toBeInTheDocument();
    expect(screen.getByText("客户管理")).toBeInTheDocument();
  });

  it("renders DashboardPage with Tabs-based time range switcher", async () => {
    const handleRangeChange = vi.fn();

    renderWithProviders(<DashboardPage range="30d" onRangeChange={handleRangeChange} />);

    const tablist = await screen.findByRole("tablist", { name: "选择统计周期" });
    expect(tablist).toBeInTheDocument();

    const tab7d = within(tablist).getByRole("tab", { name: "7天" });
    expect(tab7d).toBeInTheDocument();

    fireEvent.click(tab7d);
    expect(handleRangeChange).toHaveBeenCalledWith("7d");
  });
});
