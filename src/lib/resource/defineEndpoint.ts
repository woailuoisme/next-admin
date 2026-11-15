import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";

import type { ResourceCustomAction } from "./types";

const DEFAULT_STALE_TIME = 30 * 1000;

export interface EndpointQuerySpec<TData = any, TVars = void, TSelected = TData> {
  key: readonly unknown[] | ((vars: TVars) => readonly unknown[]);
  queryFn: (vars: TVars) => Promise<TData>;
  staleTime?: number;
  select?: (data: TData) => TSelected;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
}

export interface DefineEndpointConfig<
  TQueries extends Record<string, EndpointQuerySpec<any, any, any>>,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  name: string;
  invalidates?: readonly (readonly unknown[])[];
  queries: TQueries;
  actions?: TActions;
}

type EndpointQueryCaller<TSpec extends EndpointQuerySpec<any, any, any>> = TSpec extends {
  select: (data: infer TData) => infer TSelected;
}
  ? TSpec extends EndpointQuerySpec<any, infer TVars, any>
    ? [TVars] extends [void]
      ? () => UseQueryOptions<TData, Error, TSelected>
      : (vars?: TVars) => UseQueryOptions<TData, Error, TSelected>
    : never
  : TSpec extends EndpointQuerySpec<infer TData, infer TVars, any>
    ? [TVars] extends [void]
      ? () => UseQueryOptions<TData, Error, TData>
      : (vars?: TVars) => UseQueryOptions<TData, Error, TData>
    : never;

export interface EndpointDefinition<
  TQueries extends Record<string, EndpointQuerySpec<any, any, any>>,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  readonly name: string;
  readonly keys: { readonly all: readonly [string] };
  readonly invalidates: readonly (readonly unknown[])[];
  readonly queries: {
    all: () => readonly [string];
  } & {
    [K in keyof TQueries]: EndpointQueryCaller<TQueries[K]>;
  };
  readonly actions: TActions;
}

/**
 * defineEndpoint:
 * 为非 CRUD 域（如 Dashboard、Notifications 等只读聚合/自定义动作域）提供
 * 与 `defineResource` 对齐的 RSC 安全契约工厂，消除手写 api.ts / queries.ts 胶水文件。
 */
export function defineEndpoint<
  TQueries extends Record<string, EndpointQuerySpec<any, any, any>>,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
>(config: DefineEndpointConfig<TQueries, TActions>): EndpointDefinition<TQueries, TActions> {
  const { name, invalidates = [], queries: querySpecs, actions } = config;
  const allKey = [name] as const;

  const builtQueries: Record<string, unknown> = {
    all: () => allKey,
  };

  for (const [queryName, spec] of Object.entries(querySpecs)) {
    builtQueries[queryName] = (vars: unknown) => {
      const subKey = typeof spec.key === "function" ? spec.key(vars) : spec.key;
      return queryOptions({
        queryKey: [...allKey, ...subKey],
        queryFn: () => spec.queryFn(vars),
        staleTime: spec.staleTime ?? DEFAULT_STALE_TIME,
        ...(spec.select ? { select: spec.select } : {}),
        ...(spec.refetchInterval !== undefined ? { refetchInterval: spec.refetchInterval } : {}),
        ...(spec.refetchIntervalInBackground !== undefined
          ? { refetchIntervalInBackground: spec.refetchIntervalInBackground }
          : {}),
      });
    };
  }

  return {
    name,
    keys: { all: allKey },
    invalidates,
    queries: builtQueries as EndpointDefinition<TQueries, TActions>["queries"],
    actions: (actions ?? {}) as TActions,
  };
}
