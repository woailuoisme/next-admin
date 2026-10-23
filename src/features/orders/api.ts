import type { ApiResponse } from "@/types";

import { apiClient, toSearchParams } from "@/lib/apiClient";

import type { Order, OrderFilters, OrderListResponse, OrderStatus } from "./types";

export async function fetchOrders(filters: OrderFilters): Promise<OrderListResponse> {
  const params = {
    ...filters,
    status: filters.status === "all" ? undefined : filters.status,
  };
  return apiClient.get("orders", { searchParams: toSearchParams(params) }).json<OrderListResponse>();
}

export async function fetchOrderDetails(id: string): Promise<Order> {
  const res = await apiClient.get(`orders/${id}`).json<ApiResponse<Order>>();
  return res.data;
}

export async function updateOrderStatusApi(id: string, status: OrderStatus): Promise<Order> {
  const res = await apiClient.patch(`orders/${id}/status`, { json: { status } }).json<ApiResponse<Order>>();
  return res.data;
}
