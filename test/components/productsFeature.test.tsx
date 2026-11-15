import { describe, expect, it } from "vitest";

import { ResourceStats } from "@/components/resource";
import { computeProductStats } from "@/features/products/resource";
import type { Product } from "@/features/products/types";
import { ProductsActionView, ProductsListView, productUI } from "@/features/products/ui";
import { renderWithProviders, screen } from "test/test-utils";

const mockProducts: Product[] = [
  {
    id: "prod-1",
    title: "无线降噪耳机 Ultra",
    slug: "wireless-anc-headphones-ultra",
    description: "高保真音质，40小时长续航",
    price: 999.0,
    costPrice: 500.0,
    stock: 50,
    categoryId: "cat-1",
    categoryName: "智能数码",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1505740420928",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prod-2",
    title: "人体工学办公椅",
    slug: "ergonomic-office-chair",
    description: "自适应腰靠，双向调节扶手",
    price: 1200.0,
    costPrice: 600.0,
    stock: 5,
    categoryId: "cat-2",
    categoryName: "电脑办公",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1580481077197",
    createdAt: "2026-01-02T00:00:00Z",
  },
];

describe("Products Feature Tests", () => {
  it("computeProductStats calculates summary in a single pass", () => {
    const stats = computeProductStats(mockProducts);
    expect(stats.total).toBe(2);
    expect(stats.activeCount).toBe(2);
    expect(stats.lowStockCount).toBe(1); // stock: 5 <= 15
    expect(stats.avgPrice).toBe(1099.5);
  });

  it("renders ResourceStats with productUI.config.stats showing average price and negative low-stock tone", () => {
    const { container } = renderWithProviders(
      <ResourceStats
        i18nNamespace="products"
        schema={productUI.config.stats!}
        rows={mockProducts}
        total={2}
        isLoading={false}
      />,
    );

    expect(screen.getByText("总商品 SKU")).toBeInTheDocument();
    expect(screen.getByText("在架正常在售")).toBeInTheDocument();
    expect(screen.getByText("低库存预警")).toBeInTheDocument();
    expect(screen.getByText("SKU 平均单价")).toBeInTheDocument();
    expect(screen.getByText("1,099.50")).toBeInTheDocument();
    expect(container.querySelector(".text-destructive")).toBeInTheDocument();
  });

  it("renders neutral tone in product stats when no product has low stock", () => {
    const healthyStockProducts = mockProducts.map((item) => ({ ...item, stock: 50 }));
    const { container } = renderWithProviders(
      <ResourceStats
        i18nNamespace="products"
        schema={productUI.config.stats!}
        rows={healthyStockProducts}
        total={2}
        isLoading={false}
      />,
    );
    expect(container.querySelector(".text-destructive")).toBeNull();
  });

  it("renders ProductsListView with title, create action and catalog stats", async () => {
    renderWithProviders(<ProductsListView />);

    expect(await screen.findByText("商品目录")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /添加商品/ })).toBeInTheDocument();
    expect(await screen.findByText("总商品 SKU")).toBeInTheDocument();
  });

  it("renders ProductsActionView in create mode with ProductForm", async () => {
    renderWithProviders(<ProductsActionView mode="create" />);

    expect(await screen.findByText("SKU 平均单价").catch(() => null)).toBeNull();
    // Form header & submit button rendered inside ResourceSubPageScaffold
    expect(await screen.findByRole("button", { name: /确认新增|保存/ })).toBeInTheDocument();
  });
});
