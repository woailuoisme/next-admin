import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table/core/tableSearchSchema";
import { dashboardResource } from "@/features/dashboard/resource";
import { apiClient } from "@/lib/apiClient";
import { defineResource, RESOURCE_MANIFEST, type ResourceCustomAction } from "@/lib/resource";
import { toastMessages } from "@/lib/toastMessages";
import type { ApiResponse } from "@/types";

import type { Order, OrderFilters, OrderListResponse, OrderStatus } from "./types";

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

export const orderPaymentStatusSchema = z.enum(["paid", "pending", "failed"]);

export const orderSearchSchema = baseTableSearchSchema.extend({
  status: orderStatusSchema.or(z.literal("all")).optional(),
  orderId: z.string().optional(),
});

export type OrderSearchParams = z.infer<typeof orderSearchSchema>;

export const orderResource = defineResource<
  Order,
  Record<string, unknown>,
  OrderFilters,
  OrderListResponse,
  {
    updateStatus: ResourceCustomAction<{ id: string; status: OrderStatus }, Order>;
  }
>({
  ...RESOURCE_MANIFEST.orders,
  endpoint: "orders",
  searchSchema: orderSearchSchema,
  presentation: { view: "drawer" },
  modalKeys: { viewKey: "orderId" },
  invalidates: [dashboardResource.keys.all],
  transformFilters: (filters) => ({
    ...filters,
    status: filters.status === "all" ? undefined : filters.status,
  }),
  getTitle: (order) => order?.orderNumber,
  actions: {
    updateStatus: {
      mutationFn: async ({ id, status }) => {
        const res = await apiClient
          .patch(`orders/${encodeURIComponent(String(id))}/status`, { json: { status } })
          .json<ApiResponse<Order>>();
        return res.data;
      },
      successMessage: (updated) => toastMessages.statusChanged(updated.orderNumber, updated.status),
      errorMessage: () => toastMessages.statusError(),
      invalidates: [dashboardResource.keys.all],
    },
  },
});

export function computeOrderStats(rows: Order[], total?: number, serverSummary?: OrderListResponse["summary"]) {
  if (serverSummary) {
    return serverSummary;
  }
  const totalCount = total ?? rows.length;
  let pendingCount = 0;
  let deliveredCount = 0;
  let sumTotal = 0;

  for (const o of rows) {
    if (o.status === "pending" || o.status === "processing") {
      pendingCount++;
    } else if (o.status === "delivered") {
      deliveredCount++;
    }
    sumTotal += o.total ?? 0;
  }

  const avgOrderValue = rows.length > 0 ? sumTotal / rows.length : 0;

  return {
    total: totalCount,
    pendingCount,
    deliveredCount,
    avgOrderValue,
  };
}
