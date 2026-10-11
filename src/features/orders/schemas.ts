import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const ORDER_STATUS_OPTIONS: readonly {
  value: (typeof ORDER_STATUSES)[number];
  label: string;
}[] = [
  { value: "pending", label: "Pending Review" },
  { value: "processing", label: "In Processing" },
  { value: "shipped", label: "Shipped via Carrier" },
  { value: "delivered", label: "Delivered to Customer" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const ORDER_PAYMENT_STATUSES = ["paid", "pending", "failed"] as const;

export const orderPaymentStatusSchema = z.enum(ORDER_PAYMENT_STATUSES);

export const ORDER_PAYMENT_STATUS_OPTIONS: readonly {
  value: (typeof ORDER_PAYMENT_STATUSES)[number];
  label: string;
}[] = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending Payment" },
  { value: "failed", label: "Failed" },
] as const;

export const orderSearchSchema = baseTableSearchSchema.extend({
  status: orderStatusSchema.or(z.literal("all")).optional(),
  orderId: z.string().optional(),
});

export type OrderSearchParams = z.infer<typeof orderSearchSchema>;
export const orderFilterSchema = orderSearchSchema;
export type OrderFilterParams = OrderSearchParams;
