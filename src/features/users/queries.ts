import { queryOptions } from "@tanstack/react-query";

import type { CustomerFilters } from "./types";

import { fetchCustomers } from "./api";

export const EMPTY_CUSTOMER_FILTERS: CustomerFilters = Object.freeze({});

export const customerKeys = {
  all: ["users"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: CustomerFilters = EMPTY_CUSTOMER_FILTERS) =>
    [...customerKeys.lists(), filters] as const,
};

export const customerQueries = {
  all: () => customerKeys.all,
  list: (filters: CustomerFilters = EMPTY_CUSTOMER_FILTERS) =>
    queryOptions({
      queryKey: customerKeys.list(filters),
      queryFn: () => fetchCustomers(filters),
    }),
};
