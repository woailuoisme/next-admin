import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const ORDER_STATUS_OPTIONS: readonly {
  value: (typeof ORDER_STATUSES)[number];
  labelKey: "status_pending" | "status_processing" | "status_shipped" | "status_delivered" | "status_cancelled";
}[] = [
  { value: "pending", labelKey: "status_pending" },
  { value: "processing", labelKey: "status_processing" },
  { value: "shipped", labelKey: "status_shipped" },
  { value: "delivered", labelKey: "status_delivered" },
  { value: "cancelled", labelKey: "status_cancelled" },
] as const;

export const ORDER_PAYMENT_STATUSES = ["paid", "pending", "failed"] as const;

export const orderPaymentStatusSchema = z.enum(ORDER_PAYMENT_STATUSES);

export const ORDER_PAYMENT_STATUS_OPTIONS: readonly {
  value: (typeof ORDER_PAYMENT_STATUSES)[number];
  labelKey: "payment_paid" | "payment_pending" | "payment_failed";
}[] = [
  { value: "paid", labelKey: "payment_paid" },
  { value: "pending", labelKey: "payment_pending" },
  { value: "failed", labelKey: "payment_failed" },
] as const;

export const orderSearchSchema = baseTableSearchSchema.extend({
  status: orderStatusSchema.or(z.literal("all")).optional(),
  orderId: z.string().optional(),
});

export type OrderSearchParams = z.infer<typeof orderSearchSchema>;
