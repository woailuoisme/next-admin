"use client";

import { useMemoizedFn } from "ahooks";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo } from "react";

import type { BaseTableSearchParams } from "@/components/data-table/core/tableSearchSchema";
import type { TableStateAdapter } from "@/components/data-table/core/types";
import { useResourceManagement } from "@/components/data-table/hooks/useResourceManagement";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import type { DialogSize } from "@/components/dialogs/types";
import { Button } from "@/components/ui/button";
import { type ResourceDefinition, useCan } from "@/lib/resource";

import { InternalViewController, ScaffoldModalForm } from "./ResourceScaffoldControllers";
import type { ResourceContentAdapters, ResourceFormSlotContext, ResourceViewSlotContext } from "./types";
import { resolveResourcePresentation, safeResourceTranslate } from "./utils";

export type { ResourceFormSlotContext, ResourceViewSlotContext };

export interface ResourceTableSlotContext<
  TItem extends { id: string | number },
  TListResponse = { items: TItem[]; total: number },
> {
  tableState: TableStateAdapter<TItem>;
  rows: TItem[];
  total: number;
  rawResponse: TListResponse | undefined;
  isLoading: boolean;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openView: (id: string) => void;
  openDelete: (target: string | string[], items?: TItem[]) => void;
  handleBatchDelete: (selected: TItem[], clearSelection?: () => void) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ResourceStatsSlotContext<
  TItem extends { id: string | number },
  TListResponse = { items: TItem[]; total: number },
> {
  rows: TItem[];
  total: number;
  rawResponse: TListResponse | undefined;
  isLoading: boolean;
}

export interface ResourceScaffoldProps<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TFilters extends BaseTableSearchParams = BaseTableSearchParams,
  TListResponse = { items: TItem[]; total: number },
> extends ResourceContentAdapters<TItem, TInput> {
  resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, any>;
  search?: TFilters & Record<string, unknown>;
  title?: ReactNode;
  description?: ReactNode;
  createLabel?: ReactNode;
  headerExtra?: ReactNode;
  formSize?: DialogSize;
  viewSize?: DialogSize;
  allowFullscreen?: boolean;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  renderStats?: (ctx: ResourceStatsSlotContext<TItem, TListResponse>) => ReactNode;
  renderTable: (ctx: ResourceTableSlotContext<TItem, TListResponse>) => ReactNode;
}

/**
 * ResourceScaffold:
 * Refine + Filament v5 + TanStack 复合调度容器。
 * 统一接管页面 Header、RBAC 权限控制、统计卡插槽、DataTable 状态、
 * 三态 Form/View 宿主与单条/批量删除流程，彻底消除 src/features 页面层的胶水代码。
 */
export function ResourceScaffold<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TFilters extends BaseTableSearchParams = BaseTableSearchParams,
  TListResponse = { items: TItem[]; total: number },
>({
  resource,
  search,
  title,
  description,
  createLabel,
  headerExtra,
  formSize = "xl",
  viewSize = "md",
  allowFullscreen = true,
  onCreate,
  onEdit,
  onView,
  onDelete,
  resolveFormDefaults,
  viewTitle,
  viewDescription,
  viewBadge,
  renderStats,
  renderTable,
  renderForm,
  renderView,
}: ResourceScaffoldProps<TItem, TInput, TFilters, TListResponse>) {
  const t = useTranslations(resource.i18nNamespace as never);
  const router = useRouter();

  const canCreate = useCan(resource.name, "create");
  const canView = useCan(resource.name, "view");
  const canEdit = useCan(resource.name, "edit");
  const canDelete = useCan(resource.name, "delete");

  const invalidateQueryKeys = useMemo(
    () => [resource.keys.all, ...resource.invalidates] as const,
    [resource.keys.all, resource.invalidates],
  );

  const mgmt = useResourceManagement<TItem, TFilters, TListResponse>({
    entityName: resource.entityName,
    search,
    searchSchema: resource.searchSchema,
    queryOptions: resource.queries.list as any,
    paginationMode: resource.paginationMode,
    modalKeys: resource.modalKeys,
    syncModalWithUrl: resource.syncModalWithUrl,
    onOpenCreate: onCreate,
    onOpenEdit: onEdit,
    onOpenView: onView,
    onOpenDelete: onDelete,
    getEntityTitle: resource.getTitle,
    deleteMutationFn: resource.api.delete,
    batchDeleteMutationFn: resource.api.batchDelete,
    invalidateQueryKeys,
  });

  const createPresentation = resolveResourcePresentation(resource.presentation, "create");
  const editPresentation = resolveResourcePresentation(resource.presentation, "edit");
  const viewPresentation = resolveResourcePresentation(resource.presentation, "view");

  const openCreate = useMemoizedFn(() => {
    if (createPresentation === "page") {
      if (onCreate) {
        onCreate();
      } else {
        router.push(`${resource.basePath}/create`);
      }
      return;
    }
    mgmt.modal.openCreate();
  });

  const openEdit = useMemoizedFn((id: string) => {
    if (editPresentation === "page") {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`${resource.basePath}/${id}/edit`);
      }
      return;
    }
    mgmt.modal.openEdit(id);
  });

  const openView = useMemoizedFn((id: string) => {
    if (viewPresentation === "page") {
      if (onView) {
        onView(id);
      } else {
        router.push(`${resource.basePath}/${id}`);
      }
      return;
    }
    mgmt.modal.openView(id);
  });

  const resolvedTitle = title ?? safeResourceTranslate(t, resource.i18nKeys.heading) ?? resource.entityName;
  const resolvedDesc = description ?? safeResourceTranslate(t, resource.i18nKeys.headingDescription);
  const resolvedCreateLabel = createLabel ?? safeResourceTranslate(t, resource.i18nKeys.createAction);

  const formPresentation = mgmt.modal.editId ? editPresentation : createPresentation;
  const shouldMountModalForm = Boolean(renderForm && formPresentation !== "page");
  const shouldMountModalView = Boolean(renderView && viewPresentation !== "page");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{resolvedTitle}</h1>
          {resolvedDesc ? <p className="text-muted-foreground mt-0.5 text-xs">{resolvedDesc}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {renderForm && canCreate && resolvedCreateLabel ? (
            <Button
              type="button"
              onClick={openCreate}
              className="h-9 cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="size-4" aria-hidden="true" /> {resolvedCreateLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {renderStats
        ? renderStats({
            rows: mgmt.rows,
            total: mgmt.total,
            rawResponse: mgmt.rawResponse,
            isLoading: mgmt.isLoading,
          })
        : null}

      {renderTable({
        tableState: mgmt.state,
        rows: mgmt.rows,
        total: mgmt.total,
        rawResponse: mgmt.rawResponse,
        isLoading: mgmt.isLoading,
        openCreate,
        openEdit,
        openView,
        openDelete: mgmt.modal.openDelete,
        handleBatchDelete: mgmt.handleBatchDelete,
        canView,
        canEdit,
        canDelete,
      })}

      {shouldMountModalForm && renderForm ? (
        <ScaffoldModalForm
          resource={resource}
          presentation={formPresentation}
          open={mgmt.isFormOpen}
          onOpenChange={mgmt.handleFormOpenChange}
          editId={mgmt.modal.editId}
          activeEditItem={mgmt.activeEditItem}
          size={formSize}
          allowFullscreen={allowFullscreen}
          resolveFormDefaults={resolveFormDefaults}
          renderForm={renderForm}
        />
      ) : null}

      {shouldMountModalView && renderView ? (
        <InternalViewController
          resource={resource}
          presentation={viewPresentation}
          open={mgmt.modal.isViewOpen}
          onOpenChange={mgmt.handleViewOpenChange}
          viewId={mgmt.modal.viewId}
          activeViewItem={mgmt.activeViewItem}
          size={viewSize}
          allowFullscreen={allowFullscreen}
          onEdit={canEdit && renderForm ? openEdit : undefined}
          viewTitle={viewTitle}
          viewDescription={viewDescription}
          viewBadge={viewBadge}
          renderView={renderView}
        />
      ) : null}

      {resource.api.delete || resource.api.batchDelete ? <DeleteDialog {...mgmt.deleteDialogProps} /> : null}
    </div>
  );
}
