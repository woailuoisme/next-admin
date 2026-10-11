import { useMemoizedFn } from "ahooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

/** 读取 search 对象中的非空字符串参数 */
function readStringParam(search: Record<string, unknown>, key: string): string | null {
  const val = search[key];
  return typeof val === "string" && val ? val : null;
}

export interface ModalKeyMapping {
  /** URL search param key for creation modal. Defaults to "create" */
  createKey?: string;
  /** URL search param key for edit entity ID. Defaults to "editId" */
  editKey?: string;
  /** URL search param key for single delete entity ID. Defaults to "deleteId" */
  deleteKey?: string;
  /** URL search param key for details view entity ID. Defaults to "viewId" */
  viewKey?: string;
  /** URL search param key for batch delete mode. Defaults to "batchDelete" */
  batchDeleteKey?: string;
}

export interface UseResourceModalStateOptions<TData = unknown, TSearch = unknown> {
  /** Direct search params fallback when not using URL search params */
  search?: TSearch;
  /** Whether to sync modal states with URL search params. Defaults to false for localized control */
  syncWithUrl?: boolean;
  /** Custom URL search parameter key mappings */
  keys?: ModalKeyMapping;
  /** External callbacks for non-route/manual triggering */
  onCreate?: () => void;
  onOpenCreate?: () => void;
  onEdit?: (id: string) => void;
  onOpenEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpenDelete?: (id: string) => void;
  onBatchDelete?: (ids: string[], items?: TData[]) => void;
  onOpenBatchDelete?: (ids: string[], items?: TData[]) => void;
  onView?: (id: string) => void;
  onOpenView?: (id: string) => void;
}

export interface ResourceModalState<TData = unknown> {
  // Creation
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;

  // Edit
  editId: string | null;
  isEditOpen: boolean;
  openEdit: (id: string) => void;
  closeEdit: () => void;

  // View Details
  viewId: string | null;
  isViewOpen: boolean;
  openView: (id: string) => void;
  closeView: () => void;

  // Delete (Unified Single & Batch)
  deleteId: string | null;
  deleteIds: string[];
  deleteItems: TData[];
  isDeleteOpen: boolean;
  isBatchDelete: boolean;
  deleteCount: number;
  openDelete: (target: string | string[], items?: TData[]) => void;
  openBatchDelete: (ids: string[], items?: TData[]) => void;
  closeDelete: () => void;

  // Form Dialog close helper (closes either create or edit)
  closeFormDialog: () => void;
}

/**
 * useResourceModalState:
 * 工业级 CRUD 弹窗控制器 Hook。
 * 1. 深度整合 Next.js 16 App Router（useRouter / useSearchParams / usePathname）；
 * 2. 具备完备的内部本地状态控制，确保组件在 Storybook/测试或无需 URL 绑定的场景中零 Mock 独立运行；
 * 3. 统一单行删除与批量删除状态机，避免页面重复编写多份 DeleteDialog；
 * 4. 采用 ahooks useMemoizedFn 提供极致稳定的回调引用。
 */
export function useResourceModalState<TData = unknown, TSearch = unknown>(
  options: UseResourceModalStateOptions<TData, TSearch> = {},
): ResourceModalState<TData> {
  const {
    search: propSearch,
    syncWithUrl = false,
    keys,
    onCreate,
    onOpenCreate = onCreate,
    onEdit,
    onOpenEdit = onEdit,
    onDelete,
    onOpenDelete = onDelete,
    onBatchDelete,
    onOpenBatchDelete = onBatchDelete,
    onView,
    onOpenView = onView,
  } = options;

  const createKey = keys?.createKey ?? "create";
  const editKey = keys?.editKey ?? "editId";
  const deleteKey = keys?.deleteKey ?? "deleteId";
  const viewKey = keys?.viewKey ?? "viewId";
  const batchDeleteKey = keys?.batchDeleteKey ?? "batchDelete";

  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const updateUrlParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      if (!syncWithUrl || typeof window === "undefined") return;
      const current = new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : "");
      updater(current);
      const query = current.toString();
      const targetUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [nextSearchParams, pathname, router, syncWithUrl],
  );

  const activeSearch = (propSearch ?? {}) as Record<string, unknown>;

  // Fallback local states when URL syncing is disabled or initial
  const [localCreateOpen, setLocalCreateOpen] = useState(() => {
    if (syncWithUrl && nextSearchParams?.has(createKey)) {
      return nextSearchParams.get(createKey) === "true";
    }
    return Boolean(activeSearch[createKey]);
  });
  const [localEditId, setLocalEditId] = useState<string | null>(() => {
    if (syncWithUrl && nextSearchParams?.has(editKey)) {
      return nextSearchParams.get(editKey);
    }
    return readStringParam(activeSearch, editKey);
  });
  const [localViewId, setLocalViewId] = useState<string | null>(() => {
    if (syncWithUrl && nextSearchParams?.has(viewKey)) {
      return nextSearchParams.get(viewKey);
    }
    return readStringParam(activeSearch, viewKey);
  });
  const [localDeleteId, setLocalDeleteId] = useState<string | null>(() => {
    if (syncWithUrl && nextSearchParams?.has(deleteKey)) {
      return nextSearchParams.get(deleteKey);
    }
    return readStringParam(activeSearch, deleteKey);
  });
  const [localBatchDeleteIds, setLocalBatchDeleteIds] = useState<string[]>([]);
  const [localBatchDeleteItems, setLocalBatchDeleteItems] = useState<TData[]>([]);

  // 派生值
  const isCreateOpen =
    syncWithUrl && nextSearchParams?.has(createKey)
      ? nextSearchParams.get(createKey) === "true"
      : localCreateOpen;
  const editId = syncWithUrl && nextSearchParams?.has(editKey) ? nextSearchParams.get(editKey) : localEditId;
  const viewId = syncWithUrl && nextSearchParams?.has(viewKey) ? nextSearchParams.get(viewKey) : localViewId;
  const deleteId =
    syncWithUrl && nextSearchParams?.has(deleteKey) ? nextSearchParams.get(deleteKey) : localDeleteId;
  const isBatchDelete =
    syncWithUrl && nextSearchParams?.has(batchDeleteKey)
      ? nextSearchParams.get(batchDeleteKey) === "true"
      : localBatchDeleteIds.length > 0;
  const isDeleteOpen = Boolean(deleteId) || isBatchDelete;
  const deleteIds = deleteId ? [deleteId] : localBatchDeleteIds;
  const deleteCount = deleteId ? 1 : localBatchDeleteIds.length;

  // Actions
  const openCreate = useMemoizedFn(() => {
    updateUrlParams((params) => {
      params.set(createKey, "true");
    });
    setLocalCreateOpen(true);
    onOpenCreate?.();
  });

  const closeCreate = useMemoizedFn(() => {
    updateUrlParams((params) => {
      params.delete(createKey);
    });
    setLocalCreateOpen(false);
  });

  const openEdit = useMemoizedFn((id: string) => {
    updateUrlParams((params) => {
      params.set(editKey, id);
    });
    setLocalEditId(id);
    onOpenEdit?.(id);
  });

  const closeEdit = useMemoizedFn(() => {
    updateUrlParams((params) => {
      params.delete(editKey);
    });
    setLocalEditId(null);
  });

  const closeFormDialog = useMemoizedFn(() => {
    updateUrlParams((params) => {
      params.delete(createKey);
      params.delete(editKey);
    });
    setLocalCreateOpen(false);
    setLocalEditId(null);
  });

  const openView = useMemoizedFn((id: string) => {
    updateUrlParams((params) => {
      params.set(viewKey, id);
    });
    setLocalViewId(id);
    onOpenView?.(id);
  });

  const closeView = useMemoizedFn(() => {
    updateUrlParams((params) => {
      params.delete(viewKey);
    });
    setLocalViewId(null);
  });

  const openDelete = useMemoizedFn((target: string | string[], items?: TData[]) => {
    if (Array.isArray(target)) {
      setLocalBatchDeleteIds(target);
      setLocalBatchDeleteItems(items ?? []);
      updateUrlParams((params) => {
        params.set(batchDeleteKey, "true");
      });
      onOpenBatchDelete?.(target, items);
    } else {
      setLocalBatchDeleteIds([]);
      setLocalBatchDeleteItems([]);
      updateUrlParams((params) => {
        params.set(deleteKey, target);
      });
      setLocalDeleteId(target);
      onOpenDelete?.(target);
    }
  });

  const openBatchDelete = useMemoizedFn((ids: string[], items?: TData[]) => {
    openDelete(ids, items);
  });

  const closeDelete = useMemoizedFn(() => {
    setLocalBatchDeleteIds([]);
    setLocalBatchDeleteItems([]);
    updateUrlParams((params) => {
      params.delete(deleteKey);
      params.delete(batchDeleteKey);
    });
    setLocalDeleteId(null);
  });

  return {
    isCreateOpen,
    openCreate,
    closeCreate,

    editId,
    isEditOpen: Boolean(editId),
    openEdit,
    closeEdit,

    viewId,
    isViewOpen: Boolean(viewId),
    openView,
    closeView,

    deleteId,
    deleteIds,
    deleteItems: localBatchDeleteItems,
    isDeleteOpen,
    isBatchDelete,
    deleteCount,
    openDelete,
    openBatchDelete,
    closeDelete,

    closeFormDialog,
  };
}
