import { describe, expect, it, vi } from "vitest";

import { ProductMetricsCards } from "@/features/products/components/ProductMetricsCards";
import { ProductTable } from "@/features/products/components/ProductTable";
import { computeProductStats, ProductsPage } from "@/features/products/pages/ProductsPage";
import type { Product } from "@/features/products/types";
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

  it("renders ProductMetricsCards with KPI indicators", () => {
    const stats = computeProductStats(mockProducts);
    renderWithProviders(<ProductMetricsCards stats={stats} />);

    expect(screen.getByText("总商品 SKU")).toBeInTheDocument();
    expect(screen.getByText("在架正常在售")).toBeInTheDocument();
    expect(screen.getByText("低库存预警")).toBeInTheDocument();
    expect(screen.getByText("SKU 平均单价")).toBeInTheDocument();
  });

  it("renders ProductTable with items, margin financials and inventory", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    renderWithProviders(
      <ProductTable products={mockProducts} total={2} onEditProduct={handleEdit} onDeleteProduct={handleDelete} />,
    );

    expect(screen.getByText("无线降噪耳机 Ultra")).toBeInTheDocument();
    expect(screen.getByText("wireless-anc-headphones-ultra")).toBeInTheDocument();
    expect(screen.getByText("人体工学办公椅")).toBeInTheDocument();
    expect(screen.getByText("ergonomic-office-chair")).toBeInTheDocument();
  });

  it("renders ProductsPage with title, create action and catalog table", async () => {
    renderWithProviders(<ProductsPage />);

    expect(await screen.findByText("商品目录")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /添加商品/ })).toBeInTheDocument();
  });
});
