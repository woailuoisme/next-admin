import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table/core/tableSearchSchema";
import { categoryResource } from "@/features/categories/resource";
import { dashboardResource } from "@/features/dashboard/resource";
import { defineResource, RESOURCE_MANIFEST } from "@/lib/resource";

import type { Product, ProductFilters, ProductInput, ProductListResponse, ProductStatus } from "./types";

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60";

export const LOW_STOCK_THRESHOLD = 15;

export const PRODUCT_STATUSES = ["active", "draft", "out_of_stock"] as const;

export const PRODUCT_STATUS_LABEL_KEYS: Record<ProductStatus, string> = {
  active: "status_active",
  draft: "status_draft",
  out_of_stock: "status_out_of_stock",
};

export function buildProductStatusMap(t: (key: string) => string): Record<ProductStatus, string> {
  return {
    active: t(PRODUCT_STATUS_LABEL_KEYS.active),
    draft: t(PRODUCT_STATUS_LABEL_KEYS.draft),
    out_of_stock: t(PRODUCT_STATUS_LABEL_KEYS.out_of_stock),
  };
}

export function buildProductStatusOptions(t: (key: string) => string) {
  return PRODUCT_STATUSES.map((value) => ({
    label: t(PRODUCT_STATUS_LABEL_KEYS[value]),
    value,
  }));
}

export const productStatusSchema = z.enum(PRODUCT_STATUSES);

export const productInputSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  price: z.number().min(0.01),
  costPrice: z.number().min(0),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  status: productStatusSchema,
  imageUrl: z.url(),
  description: z.string().min(5),
});

export const productSearchSchema = baseTableSearchSchema.extend({
  categoryId: z.string().optional(),
  status: productStatusSchema.or(z.literal("all")).optional(),
  createProduct: z.boolean().optional(),
  editProductId: z.string().optional(),
});

export type ProductSearchParams = z.infer<typeof productSearchSchema>;

export const productResource = defineResource<Product, ProductInput, ProductFilters, ProductListResponse>({
  ...RESOURCE_MANIFEST.products,
  endpoint: "products",
  schema: productInputSchema,
  searchSchema: productSearchSchema,
  presentation: "dialog",
  modalKeys: {
    createKey: "createProduct",
    editKey: "editProductId",
  },
  invalidates: [dashboardResource.keys.all, categoryResource.keys.all],
  transformFilters: (filters) => ({
    ...filters,
    status: filters.status === "all" ? undefined : filters.status,
    categoryId: filters.categoryId === "all" ? undefined : filters.categoryId,
  }),
  defaultValues: {
    title: "",
    slug: "",
    price: 0,
    costPrice: 0,
    stock: 0,
    categoryId: "",
    status: "active",
    imageUrl: DEFAULT_PRODUCT_IMAGE,
    description: "",
  },
  toFormValues: (product) => ({
    title: product.title,
    slug: product.slug,
    price: product.price,
    costPrice: product.costPrice,
    stock: product.stock,
    categoryId: product.categoryId,
    status: product.status,
    imageUrl: product.imageUrl,
    description: product.description,
  }),
  getTitle: (product) => product?.title,
});

export function computeProductStats(rows: Product[], total?: number, serverSummary?: ProductListResponse["summary"]) {
  if (serverSummary) {
    return serverSummary;
  }
  const totalCount = total ?? rows.length;
  let activeCount = 0;
  let lowStockCount = 0;
  let sumPrice = 0;

  for (const p of rows) {
    if (p.status === "active") {
      activeCount++;
    }
    if (p.stock <= LOW_STOCK_THRESHOLD || p.status === "out_of_stock") {
      lowStockCount++;
    }
    sumPrice += p.price ?? 0;
  }

  const avgPrice = rows.length > 0 ? sumPrice / rows.length : 0;

  return {
    total: totalCount,
    activeCount,
    lowStockCount,
    avgPrice,
  };
}
