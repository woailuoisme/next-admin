import { describe, expect, it, vi } from "vitest";

import { ResourceStats, ResourceViewHost } from "@/components/resource";
import { computeOrderStats } from "@/features/orders/resource";
import type { Order } from "@/features/orders/types";
import { OrdersListView, orderUI } from "@/features/orders/ui";
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

  it("renders ResourceStats with orderUI.config.stats showing formatted AOV and pending alert tone", () => {
    const { container } = renderWithProviders(
      <ResourceStats
        i18nNamespace="orders"
        schema={orderUI.config.stats!}
        rows={mockOrders}
        total={2}
        isLoading={false}
      />,
    );

    expect(screen.getByText("平台总订单数")).toBeInTheDocument();
    expect(screen.getByText("待发货 / 履约中")).toBeInTheDocument();
    expect(screen.getByText("已交付完成")).toBeInTheDocument();
    expect(screen.getByText("平均客单价 (AOV)")).toBeInTheDocument();
    expect(screen.getByText("500.00")).toBeInTheDocument();
    expect(container.querySelector(".text-destructive")).toBeInTheDocument();
  });

  it("renders neutral tone in order stats when no order is pending", () => {
    const deliveredOrders = mockOrders.map((order) => ({ ...order, status: "delivered" as const }));
    const { container } = renderWithProviders(
      <ResourceStats
        i18nNamespace="orders"
        schema={orderUI.config.stats!}
        rows={deliveredOrders}
        total={2}
        isLoading={false}
      />,
    );
    expect(container.querySelector(".text-destructive")).toBeNull();
  });

  it("renders OrdersListView with header, KPI cards and table", async () => {
    renderWithProviders(<OrdersListView />);

    expect(await screen.findByText("订单履约")).toBeInTheDocument();
    expect(await screen.findByText("平台总订单数")).toBeInTheDocument();
  });

  it("renders declarative order infolist inside ResourceViewHost with ActionSelectEntry, customer entries, and SummaryEntry", async () => {
    renderWithProviders(
      <ResourceViewHost presentation="drawer" open={true} onOpenChange={vi.fn()} title={mockOrders[0].orderNumber}>
        {orderUI.config.infolist?.render({ entity: mockOrders[0], isLoading: false, t: ((k: string) => k) as never })}
      </ResourceViewHost>,
    );

    expect(await screen.findByText("履约进度")).toBeInTheDocument();
    expect(screen.getByText("王小明")).toBeInTheDocument();
    expect(screen.getByText("wang@example.com")).toBeInTheDocument();
    expect(screen.getByText("机械键盘 Pro")).toBeInTheDocument();
    expect(screen.getByText("$800.00")).toBeInTheDocument();
  });
});
