import type { QueryClient } from "@tanstack/react-query";

import { and, eq, gt, gte, lt, lte, or } from "@tanstack/db";
import { queryCollectionOptions, type QueryCollectionConfig } from "@tanstack/query-db-collection";
import {
  createCollection,
  DbClient,
  DbProvider,
  type Collection,
  localOnlyCollectionOptions,
  localStorageCollectionOptions,
  useDbClient,
  useLiveQuery,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";

import { getActiveQueryClient } from "@/lib/query-client";

/**
 * Global TanStack DB Client instance
 */
export const dbClient = new DbClient();

/**
 * Convenience helper to create a Query-backed TanStack DB Collection
 * Automatically resolves the active QueryClient if not explicitly provided.
 */
export function createQueryCollection<T extends object, TKey extends string | number = string>(
  options: Omit<QueryCollectionConfig<T, any, unknown, any, TKey>, "queryClient"> & {
    queryClient?: QueryClient;
  },
): Collection<T, TKey> {
  const client = options.queryClient ?? getActiveQueryClient();
  if (!client) {
    // In SSR or testing contexts without an initialized active client,
    // fallback to lazy client or in-memory localOnlyCollection to prevent crash
    return createCollection(
      localOnlyCollectionOptions({
        getKey: options.getKey,
      }),
    ) as unknown as Collection<T, TKey>;
  }

  return createCollection(
    queryCollectionOptions({
      ...options,
      queryClient: client,
    }),
  );
}

export {
  createCollection,
  DbClient,
  DbProvider,
  useDbClient,
  useLiveQuery,
  useLiveSuspenseQuery,
  localOnlyCollectionOptions,
  localStorageCollectionOptions,
  queryCollectionOptions,
  // Query Operators
  eq,
  and,
  or,
  gt,
  gte,
  lt,
  lte,
};
