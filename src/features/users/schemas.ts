import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table";

export const CUSTOMER_STATUSES = ["active", "inactive"] as const;
export const CUSTOMER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export const customerStatusSchema = z.enum(CUSTOMER_STATUSES);

export const customerSearchSchema = baseTableSearchSchema.extend({
  status: customerStatusSchema.or(z.literal("all")).optional(),
  customerId: z.string().optional(),
});

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;
export const customerFilterSchema = customerSearchSchema;
export type CustomerFilterParams = CustomerSearchParams;
