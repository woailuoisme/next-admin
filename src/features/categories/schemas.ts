import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table";

export const categoryInputSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
});

export const categorySearchSchema = baseTableSearchSchema.extend({
  createCategory: z.boolean().optional(),
  editCategoryId: z.string().optional(),
  deleteCategoryId: z.string().optional(),
});
export type CategorySearchParams = z.infer<typeof categorySearchSchema>;
