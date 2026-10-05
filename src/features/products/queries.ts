import { queryOptions } from "@tanstack/react-query";

import type { ProductFilters } from "./types";

import { fetchProductById, fetchProducts } from "./api";

export const EMPTY_PRODUCT_FILTERS: ProductFilters = Object.freeze({});

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters = EMPTY_PRODUCT_FILTERS) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const productQueries = {
  all: () => productKeys.all,
  list: (filters: ProductFilters = EMPTY_PRODUCT_FILTERS) =>
    queryOptions({
      queryKey: productKeys.list(filters),
      queryFn: () => fetchProducts(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: productKeys.detail(id),
      queryFn: () => fetchProductById(id),
      enabled: Boolean(id),
    }),
};
