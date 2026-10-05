import { z } from "zod";

/**
 * Standard table search parameters for URL synchronization.
 * Follows Zod 4 declarative rules with zero custom error messages.
 */
export const baseTableSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type BaseTableSearchParams = z.infer<typeof baseTableSearchSchema>;
