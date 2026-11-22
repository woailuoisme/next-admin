"use client";

import { useSelector } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import type { AppFormContract } from "@/components/form/core/types";
import { handleMutationError } from "@/lib/apiClient";
import { slugify } from "@/lib/slug";
import { toastMessages } from "@/lib/toastMessages";

import type { ResourceCustomAction, ResourceDefinition } from "./types";

const EMPTY_ITEMS: readonly unknown[] = [];

const FALLBACK_FORM_STORE = {
  get: () => ({ values: undefined as Record<string, any> | undefined }),
  subscribe: () => ({ unsubscribe: () => {} }),
};

export function invalidateResourceScope(
  queryClient: ReturnType<typeof useQueryClient>,
  resource: ResourceDefinition<any, any, any, any, any>,
  extraInvalidates?: readonly (readonly unknown[])[],
) {
  void queryClient.invalidateQueries({ queryKey: resource.keys.all });
  for (const key of resource.invalidates) {
    void queryClient.invalidateQueries({ queryKey: key });
  }
  if (extraInvalidates) {
    for (const key of extraInvalidates) {
      void queryClient.invalidateQueries({ queryKey: key });
    }
  }
}

export function useResourceList<
  TItem extends { id: string | number },
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
>(resource: ResourceDefinition<TItem, any, TFilters, TListResponse, any>, filters?: TFilters) {
  return useQuery(resource.queries.list(filters));
}

export function useResourceDetail<TItem extends { id: string | number }>(
  resource: ResourceDefinition<TItem, any, any, any, any>,
  id: string,
  options?: { enabled?: boolean },
) {
  const baseQuery = resource.queries.detail(id);
  return useQuery({
    ...baseQuery,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });
}

export function useResourceCreate<TItem extends { id: string | number }, TInput>(
  resource: ResourceDefinition<TItem, TInput, any, any, any>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => {
      if (!resource.api.create) {
        throw new Error(`Resource "${resource.name}" does not implement api.create`);
      }
      return resource.api.create(input);
    },
    onSuccess: (created) => {
      invalidateResourceScope(queryClient, resource);
      const displayName = resource.getTitle?.(created) ?? String(created.id);
      toast.success(toastMessages.created(displayName));
    },
    onError: handleMutationError(toastMessages.createError()),
  });
}

export function useResourceUpdate<TItem extends { id: string | number }, TInput>(
  resource: ResourceDefinition<TItem, TInput, any, any, any>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TInput> }) => {
      if (!resource.api.update) {
        throw new Error(`Resource "${resource.name}" does not implement api.update`);
      }
      return resource.api.update(id, input);
    },
    onSuccess: (updated) => {
      invalidateResourceScope(queryClient, resource);
      const displayName = resource.getTitle?.(updated) ?? String(updated.id);
      toast.success(toastMessages.updated(displayName));
    },
    onError: handleMutationError(toastMessages.updateError()),
  });
}

export function useResourceDelete<TItem extends { id: string | number }>(
  resource: ResourceDefinition<TItem, any, any, any, any>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!resource.api.delete) {
        throw new Error(`Resource "${resource.name}" does not implement api.delete`);
      }
      return resource.api.delete(id);
    },
    onSuccess: () => {
      invalidateResourceScope(queryClient, resource);
      toast.success(toastMessages.deleted());
    },
    onError: handleMutationError(toastMessages.deleteError()),
  });
}

export function useResourceAction<
  TActions extends Record<string, ResourceCustomAction<any, any>>,
  TActionKey extends keyof TActions,
>(
  resource: {
    readonly keys: { readonly all: readonly unknown[] };
    readonly invalidates: readonly (readonly unknown[])[];
    readonly actions: TActions;
  },
  actionKey: TActionKey,
) {
  type TVars = TActions[TActionKey] extends ResourceCustomAction<infer V, any> ? V : never;
  type TResult = TActions[TActionKey] extends ResourceCustomAction<any, infer R> ? R : never;

  const queryClient = useQueryClient();
  const actionDef = resource.actions[actionKey] as ResourceCustomAction<TVars, TResult>;

  return useMutation<TResult, Error, TVars>({
    mutationFn: (vars: TVars) => actionDef.mutationFn(vars),
    onSuccess: (result, vars) => {
      invalidateResourceScope(
        queryClient,
        resource as unknown as ResourceDefinition<any, any, any, any, any>,
        actionDef.invalidates,
      );
      if (actionDef.successMessage) {
        toast.success(actionDef.successMessage(result, vars));
      }
    },
    onError: handleMutationError(actionDef.errorMessage?.() ?? toastMessages.updateError()),
  });
}

export interface UseResourceOptionsConfig<TItem extends { id: string | number }, TFilters> {
  filters?: TFilters;
  mapOption?: (item: TItem) => { label: string; value: string };
  form?: AppFormContract;
  autoSelectField?: string;
  isEditing?: boolean;
}

/**
 * useResourceOptions:
 * 从关联资源（如 Category）拉取列表并自动映射为 SelectOption，
 * 可选在创建态首项自动回填指定表单字段，消除业务表单内的 useEffect/useMemo 样板代码。
 * 通过订阅 form.store 确保即便父容器执行 form.reset 重置默认值后也能可靠保留首项预选且不污染 isDirty。
 */
export function useResourceOptions<
  TItem extends { id: string | number; name?: string },
  TFilters = Record<string, unknown>,
>(
  resource: ResourceDefinition<TItem, any, TFilters, TItem[], any>,
  config: UseResourceOptionsConfig<TItem, TFilters> = {},
) {
  const { filters, mapOption, form, autoSelectField, isEditing = false } = config;
  const { data: rawItems, isLoading } = useResourceList(resource, filters);
  const items = (rawItems ?? EMPTY_ITEMS) as TItem[];

  const trackedFieldValue = useSelector(form?.store ?? FALLBACK_FORM_STORE, (state) =>
    autoSelectField ? state?.values?.[autoSelectField] : undefined,
  );

  useEffect(() => {
    if (isEditing || !form || !autoSelectField || items.length === 0) return;
    const currentValue = trackedFieldValue ?? form.getFieldValue?.(autoSelectField);
    if (currentValue !== undefined && currentValue !== null && currentValue !== "") return;
    const firstId = String(items[0].id);
    if (firstId) {
      form.setFieldValue?.(autoSelectField, firstId, { dontUpdateMeta: true });
    }
  }, [autoSelectField, form, isEditing, items, trackedFieldValue]);

  const options = useMemo(
    () =>
      items.map((item) =>
        mapOption ? mapOption(item) : { label: String(item.name ?? item.id), value: String(item.id) },
      ),
    [items, mapOption],
  );

  return { options, items, isLoading };
}

/**
 * useSlugSync:
 * 创建态下根据源输入文本自动派生并写入目标 slug 字段。
 */
export function useSlugSync(form: AppFormContract, targetField = "slug", enabled = true) {
  return useMemoizedFn((val: string) => {
    if (enabled && val) {
      form.setFieldValue?.(targetField, slugify(val));
    }
  });
}
