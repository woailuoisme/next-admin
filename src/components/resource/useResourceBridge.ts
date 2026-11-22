"use client";

import { useTranslations } from "next-intl";
import { createElement, type ReactNode } from "react";

import { ActionList, type ActionListProps, type ActionRuntimeResourceBridge } from "@/components/actions";
import type { ViewDialogProps } from "@/components/dialogs";
import type { ResourceDefinition, ResourcePresentationConfig } from "@/lib/resource";

import type { ResourceActionsInput, ResourcePresentation, ResourceTranslateFn, ResourceViewSlotContext } from "./types";

/**
 * 解析资源视图形态配置（dialog / drawer / page）
 */
export function resolveResourcePresentation(
  presentation: ResourcePresentation | ResourcePresentationConfig | undefined,
  key: "create" | "edit" | "view",
): ResourcePresentation {
  if (!presentation) return "dialog";
  if (typeof presentation === "string") return presentation;
  return presentation[key] ?? "dialog";
}

/**
 * 安全解析资源命名空间翻译键（仅用于资源配置携带的动态 i18n Key）
 */
export function safeResourceTranslate(
  t: ReturnType<typeof useTranslations> | ResourceTranslateFn,
  key?: string,
): string | undefined {
  if (!key) return undefined;
  if (typeof (t as { has?: (k: string) => boolean }).has === "function") {
    return (t as { has: (k: string) => boolean }).has(key) ? (t as ResourceTranslateFn)(key) : undefined;
  }
  return undefined;
}

/**
 * 解析资源动作输入（静态数组或函数式动作工厂）
 */
export function resolveResourceActionsInput<TPayload>(
  input: ResourceActionsInput<TPayload> | undefined,
  t: ResourceTranslateFn,
) {
  if (!input) return undefined;
  return typeof input === "function" ? input({ t }) : input;
}

/**
 * 统一构造资源表单默认值（编辑态优先透传实体映射，新建态回落 resource.defaultValues）
 */
export function resolveResourceFormDefaults<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown>,
>(
  resource: ResourceDefinition<TItem, TInput, any, any, any>,
  entity: TItem | null,
  customResolver?: (entity: TItem | null) => TInput,
): TInput {
  if (customResolver) {
    return customResolver(entity);
  }
  if (entity && resource.toFormValues) {
    return resource.toFormValues(entity);
  }
  if (entity) {
    return { ...entity } as unknown as TInput;
  }
  if (typeof resource.defaultValues === "function") {
    return resource.defaultValues();
  }
  return (resource.defaultValues ?? {}) as TInput;
}

export interface BuildResourceActionBridgeOptions<TItem extends { id: string | number }> {
  resource: ResourceDefinition<TItem, any, any, any, any>;
  rows: TItem[];
  createLabel?: ReactNode;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openView: (id: string) => void;
  onAfterDelete?: () => void;
}

/**
 * 统一构造 ActionResourceProvider 运行时桥接契约，消除列表页与子路由页的重复定义
 */
export function buildResourceActionBridge<TItem extends { id: string | number }>({
  resource,
  rows,
  createLabel,
  openCreate,
  openEdit,
  openView,
  onAfterDelete,
}: BuildResourceActionBridgeOptions<TItem>): ActionRuntimeResourceBridge<TItem> {
  return {
    resource,
    rows,
    createLabel,
    openCreate,
    openEdit,
    openView,
    onAfterDelete,
  };
}

/**
 * 共享资源视图桥接 Hook：统一提供命名空间翻译器 `t` 与 `actionBridge`
 */
export function useResourceBridge<TItem extends { id: string | number }>(
  options: BuildResourceActionBridgeOptions<TItem>,
) {
  const t = useTranslations(options.resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
  const actionBridge = buildResourceActionBridge({
    ...options,
    createLabel: options.createLabel ?? safeResourceTranslate(t, options.resource.i18nKeys.createAction),
  });
  return { t, actionBridge };
}

export interface BuildResourceViewPropsOptions<TItem extends { id: string | number }> {
  resource: ResourceDefinition<TItem, any, any, any, any>;
  t: ResourceTranslateFn;
  entity: TItem | null;
  viewTitle?: (entity: TItem | null) => ViewDialogProps["title"];
  viewDescription?: (entity: TItem | null) => ViewDialogProps["description"];
  viewBadge?: (entity: TItem | null) => ViewDialogProps["badge"];
  viewActions?: ResourceActionsInput<TItem>;
  isLoading: boolean;
  renderView: (ctx: ResourceViewSlotContext<TItem>) => ViewDialogProps["children"];
}

/**
 * 统一解析 ViewDialog 的标题、描述、徽标、扩展动作与内容渲染，供弹窗与详情子页共享
 */
export function buildResourceViewProps<TItem extends { id: string | number }>({
  resource,
  t,
  entity,
  viewTitle,
  viewDescription,
  viewBadge,
  viewActions,
  isLoading,
  renderView,
}: BuildResourceViewPropsOptions<TItem>): Pick<
  ViewDialogProps,
  "title" | "description" | "badge" | "loading" | "extraActions" | "children"
> {
  const fallbackTitle = safeResourceTranslate(t, resource.i18nKeys.viewTitle) ?? `${resource.entityName} Details`;
  const resolvedViewActions = resolveResourceActionsInput(viewActions, t);

  return {
    title: viewTitle ? viewTitle(entity) : (resource.getTitle?.(entity) ?? fallbackTitle),
    description: viewDescription ? viewDescription(entity) : safeResourceTranslate(t, "detail_sheet_desc"),
    badge: viewBadge ? viewBadge(entity) : undefined,
    loading: isLoading && !entity,
    extraActions:
      resolvedViewActions?.length && entity
        ? createElement<ActionListProps<TItem>>(ActionList, {
            actions: resolvedViewActions,
            payload: entity,
            surface: "inline",
          })
        : undefined,
    children: renderView({ entity, isLoading: isLoading && !entity }),
  };
}
