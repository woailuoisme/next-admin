import { queryOptions } from "@tanstack/react-query";

import type { OrderFilters } from "./types";

import { fetchOrderDetails, fetchOrders } from "./api";

export const EMPTY_ORDER_FILTERS: OrderFilters = Object.freeze({});

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrderFilters = EMPTY_ORDER_FILTERS) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export const orderQueries = {
  all: () => orderKeys.all,
  list: (filters: OrderFilters = EMPTY_ORDER_FILTERS) =>
    queryOptions({
      queryKey: orderKeys.list(filters),
      queryFn: () => fetchOrders(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: orderKeys.detail(id),
      queryFn: () => fetchOrderDetails(id),
      enabled: Boolean(id),
    }),
};
