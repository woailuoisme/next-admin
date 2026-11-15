"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import type { ActionItem } from "@/components/data-table/cells/action/types";
import { col } from "@/components/data-table/columns/col";
import { DataTable, type DataTableSlotProps, type TableStateAdapter } from "@/components/data-table/core";
import { exportRowsAsJson } from "@/components/data-table/hooks/useDataTableExport";
import { Button } from "@/components/ui/button";
import { useBatchMutation } from "@/hooks/useBatchMutation";
import { invalidateResourceScope, useAccessControl, useCan } from "@/lib/resource";
import type { ResourceCustomAction, ResourceDefinition } from "@/lib/resource/types";
import { toastMessages } from "@/lib/toastMessages";

import type {
  ResourceBatchActionSpec,
  ResourceQuickActionSpec,
  ResourceTableSchema,
  ResourceTranslateFn,
} from "./types";

interface BatchActionItemButtonProps<
  TItem extends { id: string | number },
  TActions extends Record<string, ResourceCustomAction<any, any>>,
> {
  spec: ResourceBatchActionSpec<TItem, TActions>;
  resource: ResourceDefinition<TItem, any, any, any, TActions>;
  selectedRows: TItem[];
  clearSelection: () => void;
  canDelete: boolean;
  handleBatchDelete: (selected: TItem[], clearSelection?: () => void) => void;
  t: ResourceTranslateFn;
}

function ResourceBatchActionButton<
  TItem extends { id: string | number },
  TActions extends Record<string, ResourceCustomAction<any, any>>,
>({
  spec,
  resource,
  selectedRows,
  clearSelection,
  canDelete,
  handleBatchDelete,
  t,
}: BatchActionItemButtonProps<TItem, TActions>) {
  const queryClient = useQueryClient();
  const canCustomPermission = useCan(
    resource.name,
    spec.kind === "action" || !spec.kind || spec.kind === "custom" ? (spec.permission ?? "edit") : "list",
  );

  const actionDef = spec.kind === "action" ? resource.actions[spec.actionKey] : undefined;
  const hasBatchFailureRef = useRef(false);

  const batchCustom = useBatchMutation<TItem>({
    mutationFn: async (item) => {
      if (spec.kind !== "action") return;
      if (!actionDef) {
        throw new Error(`Action "${spec.actionKey}" is not defined on resource "${resource.name}"`);
      }
      await actionDef.mutationFn(spec.mapVars(item));
    },
    entityName: resource.entityName,
    onSuccess: (results) => {
      if (results.length > 0) {
        invalidateResourceScope(queryClient, resource, actionDef?.invalidates);
      }
    },
    onError: () => {
      hasBatchFailureRef.current = true;
    },
  });

  if (spec.kind === "batchDelete") {
    if (!canDelete) return null;
    const Icon = spec.icon ?? Trash2;
    return (
      <Button
        variant={spec.variant ?? "destructive"}
        size="sm"
        className="h-7 gap-1 rounded-full text-xs"
        onClick={() => {
          handleBatchDelete(selectedRows, clearSelection);
        }}
      >
        <Icon className="size-3.5" />
        <span>{spec.label({ selectedCount: selectedRows.length, t })}</span>
      </Button>
    );
  }

  if (spec.kind === "exportJson") {
    const Icon = spec.icon ?? Download;
    return (
      <Button
        variant={spec.variant ?? "outline"}
        size="sm"
        className="h-7 gap-1 rounded-full text-xs"
        onClick={() => exportRowsAsJson(selectedRows, spec.exportFileName(selectedRows.length), clearSelection)}
      >
        <Icon className="size-3.5" />
        <span>{spec.label({ selectedCount: selectedRows.length, t })}</span>
      </Button>
    );
  }

  if (spec.kind === "action") {
    if (!canCustomPermission) return null;
    const Icon = spec.icon;
    return (
      <Button
        variant={spec.variant ?? "destructive"}
        size="sm"
        className="h-7 gap-1 rounded-full text-xs"
        disabled={batchCustom.isPending}
        onClick={async () => {
          hasBatchFailureRef.current = false;
          await batchCustom.mutateBatchAsync(selectedRows);
          if (!hasBatchFailureRef.current) {
            clearSelection();
          }
        }}
      >
        {Icon ? <Icon className="size-3.5" /> : null}
        <span>{spec.label({ selectedCount: selectedRows.length, t })}</span>
      </Button>
    );
  }

  if (spec.permission && !canCustomPermission) {
    return null;
  }

  const Icon = spec.icon;
  return (
    <Button
      variant={spec.variant ?? "outline"}
      size="sm"
      className="h-7 gap-1 rounded-full text-xs"
      onClick={() => void spec.onClick(selectedRows, clearSelection)}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      <span>{spec.label({ selectedCount: selectedRows.length, t })}</span>
    </Button>
  );
}

export interface ResourceTableProps<
  TItem extends { id: string | number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  resource: ResourceDefinition<TItem, any, any, any, TActions>;
  schema: ResourceTableSchema<TItem, TActions>;
  tableState: TableStateAdapter<TItem>;
  openView: (id: string) => void;
  openEdit: (id: string) => void;
  openDelete: (target: string | string[], items?: TItem[]) => void;
  handleBatchDelete: (selected: TItem[], clearSelection?: () => void) => void;
  canDelete: boolean;
}

/**
 * 声明式表格渲染引擎（Filament Table 范式）：
 * 统一接管列构造、过滤器、固定列、CSV/JSON 导出、声明式 rowActions（内置 RBAC 鉴权）
 * 及资源自定义批量/单行突变执行，彻底消除 `*Table.tsx` 壳层与 `DataTable` 业务耦合。
 */
export function ResourceTable<
  TItem extends { id: string | number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
>({
  resource,
  schema,
  tableState,
  openView,
  openEdit,
  openDelete,
  handleBatchDelete,
  canDelete,
}: ResourceTableProps<TItem, TActions>) {
  const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
  const queryClient = useQueryClient();
  const { can } = useAccessControl();

  const actionMutation = useMutation({
    mutationFn: async ({ actionKey, vars }: { actionKey: string; vars: unknown }) => {
      const def = resource.actions[actionKey];
      if (!def) {
        throw new Error(`Action "${actionKey}" is not defined on resource "${resource.name}"`);
      }
      const result = await def.mutationFn(vars);
      return { def, vars, result };
    },
    onSuccess: ({ def, vars, result }) => {
      invalidateResourceScope(queryClient, resource, def.invalidates);
      if (def.successMessage) {
        toast.success(def.successMessage(result, vars));
      }
    },
    onError: (_err, { actionKey }) => {
      const def = resource.actions[actionKey];
      toast.error(def?.errorMessage?.() ?? toastMessages.updateError());
    },
  });

  const runAction = useMemoizedFn<
    <K extends keyof TActions & string>(
      actionKey: K,
      vars: TActions[K] extends ResourceCustomAction<infer V, any> ? V : never,
    ) => void
  >((actionKey, vars) => {
    actionMutation.mutate({ actionKey, vars });
  });

  const mapCustomActionItems = useMemoizedFn(
    (items?: ResourceQuickActionSpec<TItem, TActions>[]): ActionItem<TItem>[] | undefined => {
      if (!items || items.length === 0) return undefined;
      return items.map((item) => ({
        id: item.id,
        label: item.label,
        ariaLabel: item.ariaLabel ?? item.label,
        icon: item.icon,
        tooltip: item.tooltip,
        destructive: item.destructive,
        disabled: item.disabled,
        hidden: (row: TItem) => {
          if (item.permission && !can({ resource: resource.name, action: item.permission, record: row })) {
            return true;
          }
          return typeof item.hidden === "function" ? item.hidden(row) : Boolean(item.hidden);
        },
        onClick: (row: TItem) => item.onClick(row, { runAction, isActionPending: actionMutation.isPending }),
      }));
    },
  );

  const actionPendingRef = useRef(false);
  useEffect(() => {
    actionPendingRef.current = actionMutation.isPending;
  }, [actionMutation.isPending]);

  const columns = useMemo(() => {
    const baseCols = schema.columns({
      t,
      openView,
      openEdit,
      openDelete,
      runAction,
      get isActionPending() {
        return actionPendingRef.current;
      },
    });

    if (!schema.rowActions) return baseCols;

    const spec = typeof schema.rowActions === "function" ? schema.rowActions(t) : schema.rowActions;
    const actionsColumn = col.actions<TItem>({
      field: spec.field ?? "__actions",
      headerName: spec.headerName,
      width: spec.width ?? 80,
      align: spec.align,
      headerAlign: spec.headerAlign,
      pinned: spec.pinned ?? "right",
      maxQuickActions: spec.maxQuickActions,
      moreActionsLabel: spec.moreActionsLabel,
      quickActions: mapCustomActionItems(spec.quick),
      dropdownActions: mapCustomActionItems(spec.dropdown),
      crud: spec.crud
        ? {
            onView: spec.crud.view ? (row) => openView(String(row.id)) : undefined,
            viewLabel: spec.crud.viewLabel,
            isViewHidden: (row) => !can({ resource: resource.name, action: "view", record: row }),
            onEdit: spec.crud.edit ? (row) => openEdit(String(row.id)) : undefined,
            editLabel: spec.crud.editLabel,
            isEditHidden: (row) => !can({ resource: resource.name, action: "edit", record: row }),
            onDelete: spec.crud.delete ? (row) => openDelete(String(row.id), [row]) : undefined,
            deleteLabel: spec.crud.deleteLabel,
            isDeleteHidden: (row) => !can({ resource: resource.name, action: "delete", record: row }),
          }
        : undefined,
    });

    return [...baseCols, actionsColumn];
  }, [can, mapCustomActionItems, openDelete, openEdit, openView, resource.name, runAction, schema, t]);

  const filters = useMemo(() => schema.filters?.(t), [schema, t]);

  const slotProps = useMemo<DataTableSlotProps | undefined>(() => {
    if (!schema.exportFileName && !schema.slotProps) return undefined;
    return {
      ...schema.slotProps,
      toolbar: {
        ...schema.slotProps?.toolbar,
        ...(schema.exportFileName ? { exportFileName: schema.exportFileName } : {}),
      },
    };
  }, [schema.exportFileName, schema.slotProps]);

  const getRowId = useMemoizedFn((row: TItem) => (schema.getRowId ? schema.getRowId(row) : String(row.id)));

  const handleRowClick = useMemo(() => {
    if (!schema.onRowClick) return undefined;
    if (schema.onRowClick === "view") {
      return (row: TItem) => openView(String(row.id));
    }
    const customClick = schema.onRowClick;
    return (row: TItem) => customClick(row, { openView, openEdit });
  }, [openEdit, openView, schema]);

  const renderBatchActions = useMemo(() => {
    const specs = schema.batchActions;
    if (!specs || specs.length === 0) return undefined;
    return (selectedRows: TItem[], clearSelection: () => void) => (
      <div className="flex items-center gap-2">
        {specs.map((spec) => (
          <ResourceBatchActionButton
            key={spec.id}
            spec={spec}
            resource={resource}
            selectedRows={selectedRows}
            clearSelection={clearSelection}
            canDelete={canDelete}
            handleBatchDelete={handleBatchDelete}
            t={t}
          />
        ))}
      </div>
    );
  }, [canDelete, handleBatchDelete, resource, schema.batchActions, t]);

  return (
    <DataTable<TItem>
      state={tableState}
      columns={columns}
      getRowId={getRowId}
      checkboxSelection={schema.checkboxSelection ?? Boolean(schema.batchActions?.length)}
      pinnedColumns={schema.pinnedColumns}
      filters={filters}
      onRowClick={handleRowClick}
      slotProps={slotProps}
      batchActions={renderBatchActions}
    />
  );
}
