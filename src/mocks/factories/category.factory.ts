import { countBy } from "es-toolkit";

import type { Category } from "@/features/categories";
import type { Product } from "@/features/products";

export const BASE_CATEGORIES: Omit<Category, "productCount">[] = [
  {
    id: "cat-1",
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets, audio, peripherals and consumer hardware",
  },
  {
    id: "cat-2",
    name: "Office & Workspace",
    slug: "office-workspace",
    description: "Ergonomic furniture, desk accessories and setup essentials",
  },
  {
    id: "cat-3",
    name: "Apparel & Gear",
    slug: "apparel-gear",
    description: "Performance clothing, technical bags and daily carry",
  },
  {
    id: "cat-4",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Artisan cookware, appliances and modern lifestyle goods",
  },
];

export function createInitialCategories(): Category[] {
  return BASE_CATEGORIES.map((cat) => ({
    ...cat,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
  }));
}

export function syncCategoryProductCounts(categories: Category[], products: Product[]): Category[] {
  const counts = countBy(products, (p) => p.categoryId);

  return categories.map((cat) => ({
    ...cat,
    productCount: counts[cat.id] ?? 0,
  }));
}
