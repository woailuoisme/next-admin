import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table";

export const PRODUCT_STATUSES = ["active", "draft", "out_of_stock"] as const;

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
  deleteProductId: z.string().optional(),
});

export type ProductSearchParams = z.infer<typeof productSearchSchema>;
