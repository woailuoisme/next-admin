import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, type Collection } from "@tanstack/react-db";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Product, ProductInput } from "./types";

import { createProductApi, deleteProductApi, fetchProducts, updateProductApi } from "./api";
import { productKeys } from "./queries";

const productsCollectionCache = new WeakMap<QueryClient, Collection<Product, string>>();

/**
 * Returns a reactive TanStack DB Collection for Products tied to the QueryClient instance.
 * Automatically synchronizes with REST API via queryCollectionOptions, providing
 * sub-millisecond differential dataflow live queries and automatic optimistic mutations with rollback.
 */
export function getProductsCollection(queryClient: QueryClient): Collection<Product, string> {
  let collection = productsCollectionCache.get(queryClient);
  if (!collection) {
    collection = createCollection(
      queryCollectionOptions({
        queryKey: productKeys.all,
        queryFn: async () => {
          const res = await fetchProducts({ page: 1, pageSize: 1000 });
          return res.items;
        },
        getKey: (p: Product) => p.id,
        queryClient: queryClient as never,
        onInsert: async ({ transaction }) => {
          await Promise.all(
            transaction.mutations.map(async (m) => {
              const input = m.modified as ProductInput;
              await createProductApi(input);
            }),
          );
        },
        onUpdate: async ({ transaction }) => {
          await Promise.all(
            transaction.mutations.map(async (m) => {
              const updated = m.modified as Product;
              await updateProductApi(updated.id, updated);
            }),
          );
        },
        onDelete: async ({ transaction }) => {
          await Promise.all(
            transaction.mutations.map(async (m) => {
              const original = m.original as Product;
              await deleteProductApi(original.id);
            }),
          );
        },
      }),
    ) as unknown as Collection<Product, string>;
    productsCollectionCache.set(queryClient, collection);
  }
  return collection;
}

/**
 * Hook to retrieve the current Products Collection in React components
 */
export function useProductsCollection(): Collection<Product, string> {
  const queryClient = useQueryClient();
  return useMemo(() => getProductsCollection(queryClient), [queryClient]);
}
