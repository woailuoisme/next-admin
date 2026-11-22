import { AlertTriangle, Copy, Download, Eye, Pencil, Plus, RotateCcw, Trash2, Upload } from "lucide-react";

import { en, zh } from "@/i18n";
import { createScopedTranslator } from "@/i18n/scoped";
import { toastMessages } from "@/lib/toastMessages";

import {
  defaultExcludedClone,
  type BatchDeleteActionConfig,
  type DeleteActionConfig,
  type LifecycleTrashedActionConfig,
  type ReplicateActionConfig,
  type ResourceActionOverride,
} from "./builderTypes";
import type { ActionConfirmConfig, ActionDef, ExportActionConfig, ImportActionConfig } from "./types";

const getDialogT = createScopedTranslator("dialog", { zh: zh.dialog, en: en.dialog });
const getActionsT = createScopedTranslator("actions", { zh: zh.actions, en: en.actions });

export const crudActionBuilders = {
  /**
   * 预置新建动作（Resource 上下文中自动调用 openCreate）
   */
  create(overrides: ResourceActionOverride<void> = {}): ActionDef<void> {
    return {
      kind: "action",
      id: overrides.id ?? "crud-create",
      label: overrides.label,
      defaultLabelKey: "create",
      icon: overrides.icon ?? Plus,
      color: overrides.color ?? "primary",
      variant: overrides.variant ?? "default",
      authorize: overrides.authorize ?? "create",
      hidden: overrides.hidden,
      disabled: overrides.disabled,
      tooltip: overrides.tooltip,
      size: overrides.size,
      separator: overrides.separator,
      handler: async ({ resourceBridge }) => {
        if (overrides.onExecute) {
          await overrides.onExecute();
          return;
        }
        resourceBridge?.openCreate();
      },
    };
  },

  /**
   * 预置查看详情动作（Resource 上下文中自动调用 openView）
   */
  view<TItem extends { id: string | number } = any>(overrides: ResourceActionOverride<TItem> = {}): ActionDef<TItem> {
    return {
      kind: "action",
      id: overrides.id ?? "crud-view",
      label: overrides.label,
      defaultLabelKey: "view",
      tooltip: overrides.tooltip ?? overrides.label,
      icon: overrides.icon ?? Eye,
      authorize: overrides.authorize ?? "view",
      hidden: overrides.hidden,
      disabled: overrides.disabled,
      color: overrides.color,
      variant: overrides.variant,
      size: overrides.size,
      separator: overrides.separator,
      handler: async ({ payload, resourceBridge }) => {
        if (overrides.onExecute) {
          await overrides.onExecute(payload);
          return;
        }
        resourceBridge?.openView(String(payload.id));
      },
    };
  },

  /**
   * 预置编辑动作（Resource 上下文中自动调用 openEdit）
   */
  edit<TItem extends { id: string | number } = any>(overrides: ResourceActionOverride<TItem> = {}): ActionDef<TItem> {
    return {
      kind: "action",
      id: overrides.id ?? "crud-edit",
      label: overrides.label,
      defaultLabelKey: "edit",
      tooltip: overrides.tooltip ?? overrides.label,
      icon: overrides.icon ?? Pencil,
      authorize: overrides.authorize ?? "edit",
      hidden: overrides.hidden,
      disabled: overrides.disabled,
      color: overrides.color,
      variant: overrides.variant,
      size: overrides.size,
      separator: overrides.separator,
      handler: async ({ payload, resourceBridge }) => {
        if (overrides.onExecute) {
          await overrides.onExecute(payload);
          return;
        }
        resourceBridge?.openEdit(String(payload.id));
      },
    };
  },

  /**
   * 预置单条删除动作（统一经由 ConfirmDialog 确认并执行 resource.api.delete + Toast + 缓存失效）
   */
  delete<TItem extends { id: string | number } = any>(overrides: DeleteActionConfig<TItem> = {}): ActionDef<TItem> {
    return {
      kind: "action",
      id: overrides.id ?? "crud-delete",
      label: overrides.label,
      defaultLabelKey: "delete",
      tooltip: overrides.tooltip ?? overrides.label,
      icon: overrides.icon ?? Trash2,
      color: overrides.color ?? "destructive",
      authorize: overrides.authorize ?? "delete",
      hidden: overrides.hidden,
      disabled: overrides.disabled,
      variant: overrides.variant,
      size: overrides.size,
      separator: overrides.separator,
      confirm:
        overrides.confirm ??
        ({
          color: "destructive",
          icon: AlertTriangle,
          requireConfirmKeyword: overrides.requireConfirmKeyword,
          confirmText: () => getDialogT()("delete_confirm_action"),
          cancelText: () => getDialogT()("cancel"),
        } satisfies ActionConfirmConfig<TItem>),
      handler: async (ctx) => {
        if (overrides.handler) {
          return overrides.handler(ctx);
        }
        const deleteFn = ctx.resourceBridge?.resource.api.delete;
        if (!deleteFn) {
          throw new Error("DeleteAction requires either handler or resource.api.delete");
        }
        await deleteFn(String(ctx.payload.id));
        ctx.resourceBridge?.onAfterDelete?.();
      },
      successMessage: () => toastMessages.deleted(),
      errorMessage: () => toastMessages.deleteError(),
    };
  },

  /**
   * 预置批量删除动作（统一经由 ConfirmDialog 确认并执行 resource.api.batchDelete / 逐项删除）
   */
  batchDelete<TItem extends { id: string | number } = any>(
    overrides: BatchDeleteActionConfig<TItem> = {},
  ): ActionDef<TItem[]> {
    return {
      kind: "action",
      id: overrides.id ?? "crud-batch-delete",
      label: overrides.label,
      defaultLabelKey: "delete",
      icon: overrides.icon ?? Trash2,
      color: overrides.color ?? "destructive",
      variant: overrides.variant ?? "destructive",
      authorize: overrides.authorize ?? "delete",
      hidden: overrides.hidden,
      disabled: overrides.disabled,
      size: overrides.size,
      separator: overrides.separator,
      confirm:
        overrides.confirm ??
        ({
          color: "destructive",
          icon: Trash2,
          requireConfirmKeyword: overrides.requireConfirmKeyword,
          confirmText: () => getDialogT()("delete_confirm_action"),
          cancelText: () => getDialogT()("cancel"),
        } satisfies ActionConfirmConfig<TItem[]>),
      handler: async (ctx) => {
        if (overrides.handler) {
          return overrides.handler(ctx);
        }
        const api = ctx.resourceBridge?.resource.api;
        if (!api) {
          throw new Error("BatchDeleteAction requires either handler or resource.api");
        }
        if (api.batchDelete) {
          await api.batchDelete(ctx.payload);
          return { succeeded: ctx.payload.length, total: ctx.payload.length };
        }
        if (!api.delete) {
          throw new Error("BatchDeleteAction requires resource.api.batchDelete or resource.api.delete");
        }
        const settled = await Promise.allSettled(ctx.payload.map((item) => api.delete!(String(item.id))));
        const succeeded = settled.filter((r) => r.status === "fulfilled").length;
        const failed = settled.length - succeeded;
        if (failed > 0) {
          throw new Error(`Batch delete partial failure: ${failed}/${settled.length}`);
        }
        return { succeeded, total: settled.length };
      },
      successMessage: (_res, { payload, resourceBridge }) =>
        toastMessages.batchSuccess(
          payload.length,
          resourceBridge?.resource.entityName ?? getDialogT()("default_entity"),
        ),
      errorMessage: () => toastMessages.deleteError(),
    };
  },
} as const;

export const lifecycleActionBuilders = {
  /**
   * 预置复制记录动作（Filament ReplicateAction）
   */
  replicate<TItem extends { id: string | number } = any>(config: ReplicateActionConfig<TItem> = {}): ActionDef<TItem> {
    const excludeFields = config.excludeFields ?? ["id", "createdAt", "updatedAt"];
    const defaultConfirm: ActionConfirmConfig<TItem> = {
      color: "primary",
      icon: Copy,
      title: (row) => getActionsT()("replicate_title", { entityName: `#${row.id}` }),
      description: () => getActionsT()("replicate_desc"),
      confirmText: () => getActionsT()("replicate_confirm"),
    };

    return {
      kind: "action",
      id: config.id ?? "crud-replicate",
      label: config.label,
      defaultLabelKey: "replicate",
      tooltip: config.tooltip ?? config.label,
      icon: config.icon ?? Copy,
      color: "default",
      authorize: config.authorize ?? "create",
      hidden: config.hidden,
      disabled: config.disabled,
      separator: config.separator,
      confirm:
        config.confirm === false
          ? undefined
          : config.confirm === true || !config.confirm
            ? defaultConfirm
            : config.confirm,
      handler: async ({ payload, resourceBridge }) => {
        const baseClone = defaultExcludedClone(payload as Record<string, unknown>, excludeFields);
        const nextPayload = config.mutateClone ? config.mutateClone(baseClone, payload) : baseClone;
        if (config.onReplicate) {
          return config.onReplicate(nextPayload, payload);
        }
        const createFn = resourceBridge?.resource.api.create;
        if (!createFn) {
          throw new Error("ReplicateAction requires either onReplicate or resource.api.create");
        }
        return createFn(nextPayload);
      },
      successMessage:
        config.successMessage ??
        ((_res, { resourceBridge }) =>
          getActionsT()("replicate_success", { entityName: resourceBridge?.resource.entityName ?? "" }).trim()),
    };
  },

  /**
   * 预置永久删除动作（Filament ForceDeleteAction，支持软删记录可见性钩子）
   */
  forceDelete<TItem extends { id: string | number } = any>(
    config: LifecycleTrashedActionConfig<TItem> = {},
  ): ActionDef<TItem> {
    return {
      kind: "action",
      id: config.id ?? "crud-force-delete",
      label: config.label,
      defaultLabelKey: "force_delete",
      tooltip: config.tooltip ?? config.label,
      icon: config.icon ?? Trash2,
      color: "destructive",
      authorize: config.authorize ?? "delete",
      separator: config.separator,
      disabled: config.disabled,
      hidden: (row) => {
        if (config.isTrashed && !config.isTrashed(row)) return true;
        return typeof config.hidden === "function" ? config.hidden(row) : Boolean(config.hidden);
      },
      confirm: config.confirm ?? {
        color: "destructive",
        icon: Trash2,
        title: () => getActionsT()("force_delete_title", { entityName: "" }).trim(),
        description: () => getActionsT()("force_delete_desc"),
        confirmText: () => getActionsT()("force_delete_confirm"),
      },
      handler: async ({ payload }) => {
        if (config.onExecute) {
          return config.onExecute(payload);
        }
      },
      successMessage:
        config.successMessage ??
        ((_res, { resourceBridge }) =>
          getActionsT()("force_delete_success", { entityName: resourceBridge?.resource.entityName ?? "" }).trim()),
    };
  },

  /**
   * 预置恢复记录动作（Filament RestoreAction，支持软删记录可见性钩子）
   */
  restore<TItem extends { id: string | number } = any>(
    config: LifecycleTrashedActionConfig<TItem> = {},
  ): ActionDef<TItem> {
    return {
      kind: "action",
      id: config.id ?? "crud-restore",
      label: config.label,
      defaultLabelKey: "restore",
      tooltip: config.tooltip ?? config.label,
      icon: config.icon ?? RotateCcw,
      color: "success",
      authorize: config.authorize ?? "edit",
      separator: config.separator,
      disabled: config.disabled,
      hidden: (row) => {
        if (config.isTrashed && !config.isTrashed(row)) return true;
        return typeof config.hidden === "function" ? config.hidden(row) : Boolean(config.hidden);
      },
      confirm: config.confirm ?? {
        color: "success",
        icon: RotateCcw,
        title: () => getActionsT()("restore_title", { entityName: "" }).trim(),
        description: () => getActionsT()("restore_desc"),
        confirmText: () => getActionsT()("restore_confirm"),
      },
      handler: async ({ payload }) => {
        if (config.onExecute) {
          return config.onExecute(payload);
        }
      },
      successMessage:
        config.successMessage ??
        ((_res, { resourceBridge }) =>
          getActionsT()("restore_success", { entityName: resourceBridge?.resource.entityName ?? "" }).trim()),
    };
  },

  /**
   * 预置导出动作（Filament ExportAction：支持选列 + XLSX/CSV/JSON，兼容 Header 与 Batch Bar）
   */
  export<TPayload = any, TItem = any>(config: ExportActionConfig<TPayload, TItem> = {}): ActionDef<TPayload> {
    return {
      kind: "action",
      id: config.id ?? "crud-export",
      label: config.label,
      defaultLabelKey: "export_label",
      tooltip: config.tooltip,
      icon: config.icon ?? Download,
      color: config.color ?? "default",
      variant: config.variant ?? "outline",
      size: config.size,
      authorize: config.authorize ?? config.permission ?? "list",
      hidden: config.hidden,
      disabled: config.disabled,
      builtinModal: {
        kind: "export",
        exportConfig: config,
      },
    };
  },

  /**
   * 预置导入动作（Filament ImportAction：支持上传解析、列映射、Zod 逐行预览校验与批量写入）
   */
  import<TInput extends Record<string, unknown> = Record<string, unknown>, TPayload = void>(
    config: ImportActionConfig<TInput, TPayload>,
  ): ActionDef<TPayload> {
    return {
      kind: "action",
      id: config.id ?? "crud-import",
      label: config.label,
      defaultLabelKey: "import_label",
      tooltip: config.tooltip,
      icon: config.icon ?? Upload,
      color: config.color ?? "default",
      variant: config.variant ?? "outline",
      size: config.size,
      authorize: config.authorize ?? config.permission ?? "create",
      hidden: config.hidden,
      disabled: config.disabled,
      builtinModal: {
        kind: "import",
        importConfig: config,
      },
    };
  },
} as const;
