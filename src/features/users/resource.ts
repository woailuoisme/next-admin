import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table/core/tableSearchSchema";
import { apiClient } from "@/lib/apiClient";
import { defineResource, RESOURCE_MANIFEST, type ResourceCustomAction } from "@/lib/resource";
import { toastMessages } from "@/lib/toastMessages";
import type { ApiResponse } from "@/types";

import type { Customer, CustomerFilters, CustomerStatus } from "./types";

export const CUSTOMER_STATUSES = ["active", "inactive"] as const;

export const CUSTOMER_STATUS_LABEL_KEYS: Record<CustomerStatus, string> = {
  active: "status_active",
  inactive: "status_inactive",
};

export function buildCustomerStatusMap(t: (key: string) => string): Record<CustomerStatus, string> {
  return {
    active: t(CUSTOMER_STATUS_LABEL_KEYS.active),
    inactive: t(CUSTOMER_STATUS_LABEL_KEYS.inactive),
  };
}

export function buildCustomerStatusOptions(t: (key: string) => string) {
  return CUSTOMER_STATUSES.map((value) => ({
    label: t(CUSTOMER_STATUS_LABEL_KEYS[value]),
    value,
  }));
}

export const customerStatusSchema = z.enum(CUSTOMER_STATUSES);

export const customerSearchSchema = baseTableSearchSchema.extend({
  status: customerStatusSchema.or(z.literal("all")).optional(),
});

export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;

export interface ToggleCustomerStatusInput {
  id: string;
  status: "active" | "inactive";
}

export const customerResource = defineResource<
  Customer,
  Record<string, unknown>,
  CustomerFilters,
  Customer[],
  {
    toggleStatus: ResourceCustomAction<ToggleCustomerStatusInput, Customer>;
  }
>({
  ...RESOURCE_MANIFEST.users,
  endpoint: "users",
  searchSchema: customerSearchSchema,
  paginationMode: "client",
  listUnwrap: "data",
  i18nKeys: {
    title: "page_title",
    description: "page_description",
    heading: "page_heading",
    headingDescription: "page_heading_desc",
  },
  transformFilters: (filters) => ({
    ...filters,
    status: filters.status === "all" ? undefined : filters.status,
  }),
  getTitle: (customer) => customer?.name,
  actions: {
    toggleStatus: {
      mutationFn: async ({ id, status }) => {
        const res = await apiClient
          .patch(`users/${encodeURIComponent(String(id))}/status`, { json: { status } })
          .json<ApiResponse<Customer>>();
        return res.data;
      },
      successMessage: (updated) => toastMessages.statusChanged(updated.name, updated.status),
      errorMessage: () => toastMessages.statusError(),
    },
  },
});
