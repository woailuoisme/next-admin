import { describe, expect, it, vi } from "vitest";

import { OrderDetailsSheet } from "@/features/orders/components/OrderDetailsSheet";
import { OrderMetricsCards } from "@/features/orders/components/OrderMetricsCards";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { computeOrderStats, OrdersPage } from "@/features/orders/pages/OrdersPage";
import type { Order } from "@/features/orders/types";
import { renderWithProviders, screen } from "test/test-utils";

const mockOrders: Order[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-2026-101",
    customerId: "cust-1",
    customerName: "王小明",
    customerEmail: "wang@example.com",
    shippingAddress: "北京市海淀区中关村南大街 1 号",
    total: 800,
    subtotal: 750,
    tax: 30,
    shipping: 20,
    status: "pending",
    items: [{ productId: "p1", productTitle: "机械键盘 Pro", price: 750, quantity: 1 }],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ord-102",
    orderNumber: "ORD-2026-102",
    customerId: "cust-2",
    customerName: "赵小红",
    customerEmail: "zhao@example.com",
    shippingAddress: "上海市浦东新区张江高科 88 号",
    total: 200,
    subtotal: 180,
    tax: 10,
    shipping: 10,
    status: "delivered",
    items: [{ productId: "p2", productTitle: "无线鼠标", price: 90, quantity: 2 }],
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

describe("Orders Feature Tests", () => {
  it("computeOrderStats calculates summary in a single pass", () => {
    const stats = computeOrderStats(mockOrders);
    expect(stats.total).toBe(2);
    expect(stats.pendingCount).toBe(1);
    expect(stats.deliveredCount).toBe(1);
    expect(stats.avgOrderValue).toBe(500);
  });

  it("renders OrderMetricsCards with KPI indicators", () => {
    const stats = computeOrderStats(mockOrders);
    renderWithProviders(<OrderMetricsCards stats={stats} />);

    expect(screen.getByText("平台总订单数")).toBeInTheDocument();
    expect(screen.getByText("待发货 / 履约中")).toBeInTheDocument();
    expect(screen.getByText("已交付完成")).toBeInTheDocument();
    expect(screen.getByText("平均客单价 (AOV)")).toBeInTheDocument();
  });

  it("renders OrdersTable with orders and status badges", () => {
    const handleView = vi.fn();

    renderWithProviders(<OrdersTable orders={mockOrders} total={2} onViewOrder={handleView} />);

    expect(screen.getByText("ORD-2026-101")).toBeInTheDocument();
    expect(screen.getByText("王小明")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-102")).toBeInTheDocument();
    expect(screen.getByText("赵小红")).toBeInTheDocument();
  });

  it("renders OrdersPage with header, KPI cards and table", async () => {
    renderWithProviders(<OrdersPage />);

    expect(await screen.findByText("订单履约")).toBeInTheDocument();
  });

  it("renders OrderDetailsSheet with order fulfillment and data list", async () => {
    const handleOpenChange = vi.fn();
    renderWithProviders(<OrderDetailsSheet orderId="ord-101" open={true} onOpenChange={handleOpenChange} />);

    expect(await screen.findByText("履约进度")).toBeInTheDocument();
  });
});
