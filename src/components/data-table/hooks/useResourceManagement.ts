import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { toastMessages } from "@/lib/toastMessages";

import type { BaseTableSearchParams } from "../core/tableSearchSchema";
import type { UseResourceTableOptions, UseResourceTableReturn } from "./useResourceTable";
import { useResourceTable } from "./useResourceTable";
import {
  type ModalKeyMapping,
  type ResourceModalState,
  useResourceModalState,
} from "@/components/dialogs/hooks/useResourceModalState";
import { useBatchMutation } from "@/hooks/useBatchMutation";

export interface UseResourceManagementOptions<
  TData extends { id: string | number } = { id: string | number } & Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> extends UseResourceTableOptions<TData, TSearch, TQueryResponse> {
  /** Entity domain label for dialog titles and toast notifications, e.g. "Product", "Order" */
  entityName?: string;
  /** Custom URL search key mappings for create, edit, view, delete modals */
  modalKeys?: ModalKeyMapping;
  /** External callback when create is opened */
  onOpenCreate?: () => void;
  /** External callback when edit is opened */
  onOpenEdit?: (id: string) => void;
  /** External callback when view is opened */
  onOpenView?: (id: string) => void;
  /** External callback when delete is opened */
  onOpenDelete?: (id: string) => void;
  /** Custom title extractor for single entity deletion confirm prompt */
  getEntityTitle?: (item: TData | null) => string | undefined;
  /** Mutation function for deleting a single entity by ID */
  deleteMutationFn?: (id: string) => Promise<unknown>;
  /** Optional custom batch mutation function */
  batchDeleteMutationFn?: (items: TData[]) => Promise<unknown>;
  /** Query keys to invalidate after successful deletion */
  invalidateQueryKeys?: readonly (readonly unknown[])[];
  /** Hook fired before an item is deleted (e.g. deleting from TanStack DB collection) */
  onBeforeItemDelete?: (item: TData | { id: string | number }) => void;
  /** Hook fired after deletion finishes */
  onAfterDelete?: () => void | Promise<void>;
}

export interface UseResourceManagementReturn<
  TData extends { id: string | number } = { id: string | number } & Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> extends UseResourceTableReturn<TData, TSearch, TQueryResponse> {
  /** Modal and drawer state machine */
  modal: ResourceModalState<TData>;
  /** Resolved entity being edited (found by modal.editId) */
  activeEditItem: TData | null;
  /** Resolved entity being deleted (found by modal.deleteId) */
  activeDeleteItem: TData | null;
  /** Resolved entity being viewed (found by modal.viewId) */
  activeViewItem: TData | null;
  /** Whether create or edit dialog should be open */
  isFormOpen: boolean;
  /** Whether single or batch delete mutation is pending */
  isDeleting: boolean;
  /** Handler for form dialog open change */
  handleFormOpenChange: (open: boolean) => void;
  /** Handler for view dialog/sheet open change */
  handleViewOpenChange: (open: boolean) => void;
  /** Handler for delete dialog open change */
  handleDeleteOpenChange: (open: boolean) => void;
  /** Confirms single or batch deletion */
  handleDeleteConfirm: () => Promise<void>;
  /** Opens batch delete modal with selected items */
  handleBatchDelete: (selected: TData[]) => void;
  /** Ready-to-spread props configured for DeleteDialog */
  deleteDialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityName: string;
    entityTitle?: string;
    itemCount: number;
    onConfirm: () => Promise<void>;
    isPending: boolean;
  };
}

/**
 * 按主键在行集合中定位实体（ID 统一转字符串比较，兼容 number / string 主键）
 */
function useRowById<TData extends { id: string | number }>(rows: TData[], id: string | null): TData | null {
  return useMemo(() => (id ? (rows.find((row) => String(row.id) === String(id)) ?? null) : null), [rows, id]);
}

/**
 * useResourceManagement:
 * 工业级 CRUD 资源页高内聚深模块 (Deep Module)。
 *
 * 架构收益 (Leverage & Locality)：
 * 1. 深度封装：接管 URL 参数绑定、表格状态流转、单条/批量删除突变、缓存失效与实体定位；
 * 2. 极简接口：向页面提供声明式配置与就绪直接展开的 tableProps 及 deleteDialogProps；
 * 3. 错误恢复：集中拦截突变异常并提供 Toast 反馈，彻底消除各个业务页面的样板代码复制。
 */
export function useResourceManagement<
  TData extends { id: string | number } = { id: string | number } & Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
>(
  options: UseResourceManagementOptions<TData, TSearch, TQueryResponse> = {},
): UseResourceManagementReturn<TData, TSearch, TQueryResponse> {
  const {
    entityName = "Item",
    modalKeys,
    onOpenCreate,
    onOpenEdit,
    onOpenView,
    onOpenDelete,
    getEntityTitle,
    deleteMutationFn,
    batchDeleteMutationFn,
    invalidateQueryKeys,
    onBeforeItemDelete,
    onAfterDelete,
    ...tableOptions
  } = options;

  const queryClient = useQueryClient();

  // 1. Table Data & Query Management
  const table = useResourceTable<TData, TSearch, TQueryResponse>(tableOptions);

  // 2. Modal & Drawer State Machine
  const modal = useResourceModalState<TData, TSearch>({
    search: table.search,
    keys: modalKeys,
    onOpenCreate,
    onOpenEdit,
    onOpenView,
    onOpenDelete,
  });

  // 3. Resolve active entities from current table rows
  const activeEditItem = useRowById(table.rows, modal.editId);
  const activeDeleteItem = useRowById(table.rows, modal.deleteId);
  const activeViewItem = useRowById(table.rows, modal.viewId);

  // 4. Invalidation Helper
  const invalidateQueries = useMemoizedFn(() => {
    if (invalidateQueryKeys && invalidateQueryKeys.length > 0) {
      for (const key of invalidateQueryKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }
  });

  // 5. Single Item Delete State
  const [isSingleDeleting, setIsSingleDeleting] = useState(false);

  // 6. Batch Mutation Runner
  const batchDelete = useBatchMutation<TData>({
    entityName,
    concurrency: 3,
    mutationFn: async (item) => {
      if (batchDeleteMutationFn) {
        return batchDeleteMutationFn([item]);
      }
      if (deleteMutationFn) {
        return deleteMutationFn(String(item.id));
      }
      return null;
    },
    onSuccess: () => {
      invalidateQueries();
    },
  });

  const isDeleting = isSingleDeleting || batchDelete.isPending;

  // 7. Unified Delete Confirmation Handler
  const handleDeleteConfirm = useMemoizedFn(async () => {
    try {
      if (modal.isBatchDelete) {
        const itemsToDelete =
          modal.deleteItems.length > 0
            ? modal.deleteItems
            : table.rows.filter((r) => modal.deleteIds.includes(String(r.id)));

        if (itemsToDelete.length > 0) {
          for (const item of itemsToDelete) {
            onBeforeItemDelete?.(item);
          }
          await batchDelete.mutateBatchAsync(itemsToDelete);
        }
      } else if (modal.deleteId && deleteMutationFn) {
        setIsSingleDeleting(true);
        onBeforeItemDelete?.(activeDeleteItem ?? { id: modal.deleteId });
        await deleteMutationFn(modal.deleteId);
        toast.success(toastMessages.deleted());
        invalidateQueries();
      }
      await onAfterDelete?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : toastMessages.deleteError();
      toast.error(msg);
    } finally {
      setIsSingleDeleting(false);
      modal.closeDelete();
    }
  });

  // 8. Dialog Event Handlers
  const handleBatchDelete = useMemoizedFn((selected: TData[]) => {
    modal.openBatchDelete(
      selected.map((item) => String(item.id)),
      selected,
    );
  });

  const handleFormOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) {
      modal.closeFormDialog();
    }
  });

  const handleViewOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) {
      modal.closeView();
    }
  });

  const handleDeleteOpenChange = useMemoizedFn((open: boolean) => {
    if (!open && !isDeleting) {
      modal.closeDelete();
    }
  });

  const isFormOpen = modal.isCreateOpen || Boolean(modal.editId);

  const resolvedEntityTitle = useMemo(() => {
    if (getEntityTitle) return getEntityTitle(activeDeleteItem);
    if (!activeDeleteItem) return undefined;
    const record = activeDeleteItem as Record<string, unknown>;
    if (typeof record.title === "string") return record.title;
    if (typeof record.name === "string") return record.name;
    return String(activeDeleteItem.id);
  }, [activeDeleteItem, getEntityTitle]);

  const deleteDialogProps = useMemo(
    () => ({
      open: modal.isDeleteOpen,
      onOpenChange: handleDeleteOpenChange,
      entityName,
      entityTitle: resolvedEntityTitle,
      itemCount: modal.deleteCount,
      onConfirm: handleDeleteConfirm,
      isPending: isDeleting,
    }),
    [
      modal.isDeleteOpen,
      handleDeleteOpenChange,
      entityName,
      resolvedEntityTitle,
      modal.deleteCount,
      handleDeleteConfirm,
      isDeleting,
    ],
  );

  return {
    ...table,
    modal,
    activeEditItem,
    activeDeleteItem,
    activeViewItem,
    isFormOpen,
    isDeleting,
    handleFormOpenChange,
    handleViewOpenChange,
    handleDeleteOpenChange,
    handleDeleteConfirm,
    handleBatchDelete,
    deleteDialogProps,
  };
}
