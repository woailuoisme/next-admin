import { omitBy } from "es-toolkit";

import type { ApiResponse } from "@/types";

import { apiClient, toSearchParams } from "@/lib/api-client";

import type { Customer, CustomerFilters } from "./types";

export async function fetchCustomers(filters: CustomerFilters = {}): Promise<Customer[]> {
  const params = omitBy(filters, (value, key) => !value || (key === "status" && value === "all"));

  const res = await apiClient
    .get("users", { searchParams: toSearchParams(params) })
    .json<ApiResponse<Customer[]>>();
  return res.data;
}

export async function toggleCustomerStatusApi(
  id: string,
  status: "active" | "inactive",
): Promise<Customer> {
  const res = await apiClient
    .patch(`users/${id}/status`, { json: { status } })
    .json<ApiResponse<Customer>>();
  return res.data;
}
