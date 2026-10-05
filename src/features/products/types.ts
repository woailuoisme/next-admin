import type { z } from "zod";

import type { productInputSchema, productSearchSchema, productStatusSchema } from "./schemas";

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductSearchParams = z.infer<typeof productSearchSchema>;
export type ProductFilters = ProductSearchParams;

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  status: ProductStatus;
  imageUrl: string;
  createdAt: string;
}

export interface ProductSparklines {
  totalSku: number[];
  activeSku: number[];
  lowStock: number[];
  avgPrice: number[];
}

export interface ProductSummary {
  total: number;
  activeCount: number;
  lowStockCount: number;
  avgPrice: number;
  sparklines?: ProductSparklines;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: ProductSummary;
}
