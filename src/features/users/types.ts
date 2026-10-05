import type { z } from "zod";

import type { customerSearchSchema, customerStatusSchema } from "./schemas";

export type CustomerStatus = z.infer<typeof customerStatusSchema>;
export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;
export type CustomerFilters = CustomerSearchParams;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  createdAt: string;
}
