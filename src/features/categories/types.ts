import type { z } from "zod";

import type { categoryInputSchema, categorySearchSchema } from "./resource";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  createdAt?: string;
}

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategorySearchParams = z.infer<typeof categorySearchSchema>;
