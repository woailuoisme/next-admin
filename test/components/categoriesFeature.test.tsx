import { describe, expect, it, vi } from "vitest";

import { CategoryTable } from "@/features/categories/components/CategoryTable";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import type { Category } from "@/features/categories/types";
import { renderWithProviders, screen } from "test/test-utils";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "智能数码",
    slug: "smart-digital",
    description: "智能穿戴与手机配件",
    productCount: 42,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "电脑办公",
    slug: "computer-office",
    description: "高效生产力工具",
    productCount: 18,
    createdAt: "2026-01-02T00:00:00Z",
  },
];

describe("Categories Feature Tests", () => {
  it("renders category catalog table with rows and columns", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    renderWithProviders(
      <CategoryTable
        categories={mockCategories}
        total={2}
        onEditCategory={handleEdit}
        onDeleteCategory={handleDelete}
      />,
    );

    expect(screen.getByText("智能数码")).toBeInTheDocument();
    expect(screen.getByText("smart-digital")).toBeInTheDocument();
    expect(screen.getByText("电脑办公")).toBeInTheDocument();
  });

  it("renders CategoriesPage header and action buttons", async () => {
    const handleCreate = vi.fn();

    renderWithProviders(<CategoriesPage onCreateCategory={handleCreate} />);

    expect(await screen.findByText("分类目录")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /新增分类/ })).toBeInTheDocument();
  });
});
