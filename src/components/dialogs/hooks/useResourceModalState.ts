"use client";

import { useMemoizedFn } from "ahooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TableRouterPort } from "@/components/data-table/adapters/types";

type SearchParamsRecord = TableRouterPort["searchParams"];

/** 读取 search 对象中的非空字符串或数字主键参数 */
function readStringParam(search: Record<string, unknown>, key: string): string | null {
  const val = search[key];
  if (typeof val === "string" && val) return val;
  if (typeof val === "number" && Number.isFinite(val)) return String(val);
  return null;
}

/** 读取布尔型开启参数（兼容 boolean true 与字符串 "true"） */
function readBooleanParam(search: Record<string, unknown>, key: string): boolean {
  const val = search[key];
  return val === true || val === "true";
}

function searchParamsToRecord(params: URLSearchParams | null): SearchParamsRecord {
  if (!params) return {};
  const record: SearchParamsRecord = {};
  params.forEach((value, key) => {
    if (value === "true") record[key] = true;
    else if (value === "false") record[key] = false;
    else record[key] = value;
  });
  return record;
}

function buildUpdatedSearchRecord(
  prev: Record<string, unknown>,
  updater: (params: URLSearchParams) => void,
): SearchParamsRecord {
  const temp = new URLSearchParams();
  for (const [k, v] of Object.entries(prev)) {
    if (v !== undefined && v !== null && v !== "") {
      temp.set(k, String(v));
    }
  }
  updater(temp);
  return searchParamsToRecord(temp);
}

interface ResolvedModalKeys {
  createKey: string;
  editKey: string;
  deleteKey: string;
  viewKey: string;
  batchDeleteKey: string;
}

interface ModalExternalSnapshot {
  create: boolean;
  editId: string | null;
  viewId: string | null;
  deleteId: string | null;
  batchDelete: boolean;
}

function readExternalSnapshot(search: Record<string, unknown>, keys: ResolvedModalKeys): ModalExternalSnapshot {
  return {
    create: readBooleanParam(search, keys.createKey),
    editId: readStringParam(search, keys.editKey),
    viewId: readStringParam(search, keys.viewKey),
    deleteId: readStringParam(search, keys.deleteKey),
    batchDelete: readBooleanParam(search, keys.batchDeleteKey),
  };
}

function areSnapshotsEqual(a: ModalExternalSnapshot, b: ModalExternalSnapshot): boolean {
  return (
    a.create === b.create &&
    a.editId === b.editId &&
    a.viewId === b.viewId &&
    a.deleteId === b.deleteId &&
    a.batchDelete === b.batchDelete
  );
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
  /** Optional pluggable router port (shared with DataTable URL state adapter) */
  router?: TableRouterPort;
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
 * Framework-agnostic modal state hook driven by an explicit `TableRouterPort` or local state.
 * Contains zero Next.js App Router imports, making unit/Storybook testing deterministic and isolated.
 */
export function useResourceModalStateWithPort<TData = unknown, TSearch = unknown>(
  options: UseResourceModalStateOptions<TData, TSearch> = {},
): ResourceModalState<TData> {
  const {
    search: propSearch,
    router: routerPort,
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

  const resolvedKeys: ResolvedModalKeys = {
    createKey: keys?.createKey ?? "create",
    editKey: keys?.editKey ?? "editId",
    deleteKey: keys?.deleteKey ?? "deleteId",
    viewKey: keys?.viewKey ?? "viewId",
    batchDeleteKey: keys?.batchDeleteKey ?? "batchDelete",
  };
  const { createKey, editKey, deleteKey, viewKey, batchDeleteKey } = resolvedKeys;

  const updateUrlParams = useMemoizedFn((updater: (params: URLSearchParams) => void, forceCleanKeys?: string[]) => {
    if (!routerPort) return;
    const shouldRun =
      syncWithUrl || (forceCleanKeys ? forceCleanKeys.some((k) => routerPort.searchParams[k] !== undefined) : false);
    if (!shouldRun) return;

    routerPort.navigate((prev) => buildUpdatedSearchRecord(prev, updater), { replace: true });
  });

  const activeSearch = (propSearch ?? routerPort?.searchParams ?? {}) as Record<string, unknown>;
  const externalSnapshot = readExternalSnapshot(activeSearch, resolvedKeys);

  const [prevSnapshot, setPrevSnapshot] = useState<ModalExternalSnapshot>(externalSnapshot);
  const [localCreateOpen, setLocalCreateOpen] = useState(externalSnapshot.create);
  const [localEditId, setLocalEditId] = useState<string | null>(externalSnapshot.editId);
  const [localViewId, setLocalViewId] = useState<string | null>(externalSnapshot.viewId);
  const [localDeleteId, setLocalDeleteId] = useState<string | null>(externalSnapshot.deleteId);
  const [localBatchDeleteIds, setLocalBatchDeleteIds] = useState<string[]>([]);
  const [localBatchDeleteItems, setLocalBatchDeleteItems] = useState<TData[]>([]);

  // Adjust state synchronously during render when external URL/search parameters change (no cascading useEffect)
  if (!areSnapshotsEqual(prevSnapshot, externalSnapshot)) {
    setPrevSnapshot(externalSnapshot);
    if (prevSnapshot.create !== externalSnapshot.create) {
      setLocalCreateOpen(externalSnapshot.create);
    }
    if (prevSnapshot.editId !== externalSnapshot.editId) {
      setLocalEditId(externalSnapshot.editId);
    }
    if (prevSnapshot.viewId !== externalSnapshot.viewId) {
      setLocalViewId(externalSnapshot.viewId);
    }
    if (prevSnapshot.deleteId !== externalSnapshot.deleteId) {
      setLocalDeleteId(externalSnapshot.deleteId);
    }
    if (prevSnapshot.batchDelete !== externalSnapshot.batchDelete && !externalSnapshot.batchDelete) {
      setLocalBatchDeleteIds([]);
      setLocalBatchDeleteItems([]);
    }
  }

  const isCreateOpen =
    syncWithUrl && routerPort && createKey in routerPort.searchParams
      ? readBooleanParam(routerPort.searchParams, createKey)
      : localCreateOpen;
  const editId =
    syncWithUrl && routerPort && editKey in routerPort.searchParams
      ? readStringParam(routerPort.searchParams, editKey)
      : localEditId;
  const viewId =
    syncWithUrl && routerPort && viewKey in routerPort.searchParams
      ? readStringParam(routerPort.searchParams, viewKey)
      : localViewId;
  const deleteId =
    syncWithUrl && routerPort && deleteKey in routerPort.searchParams
      ? readStringParam(routerPort.searchParams, deleteKey)
      : localDeleteId;
  const urlBatchDelete =
    syncWithUrl && routerPort && batchDeleteKey in routerPort.searchParams
      ? readBooleanParam(routerPort.searchParams, batchDeleteKey)
      : undefined;

  // Prevent opening an empty 0-item batch-delete modal when only stale ?batchDelete=true exists in URL
  const isBatchDelete = urlBatchDelete === false ? false : localBatchDeleteIds.length > 0;
  const isDeleteOpen = Boolean(deleteId) || isBatchDelete;
  const deleteIds = deleteId ? [deleteId] : localBatchDeleteIds;
  const deleteCount = deleteId ? 1 : localBatchDeleteIds.length;

  const clearConflictingModalParams = (params: URLSearchParams, keepKeys: string[]) => {
    for (const key of [createKey, editKey, viewKey, deleteKey, batchDeleteKey]) {
      if (!keepKeys.includes(key)) {
        params.delete(key);
      }
    }
  };

  type ModalTarget =
    | { kind: "create" }
    | { kind: "edit"; id: string }
    | { kind: "view"; id: string }
    | { kind: "delete"; id: string }
    | { kind: "batchDelete"; ids: string[]; items?: TData[] };

  const activateModal = useMemoizedFn((next: ModalTarget) => {
    let targetKey: string;
    let paramValue: string;
    switch (next.kind) {
      case "create":
        targetKey = createKey;
        paramValue = "true";
        break;
      case "edit":
        targetKey = editKey;
        paramValue = next.id;
        break;
      case "view":
        targetKey = viewKey;
        paramValue = next.id;
        break;
      case "delete":
        targetKey = deleteKey;
        paramValue = next.id;
        break;
      case "batchDelete":
        targetKey = batchDeleteKey;
        paramValue = "true";
        break;
    }

    updateUrlParams((params) => {
      clearConflictingModalParams(params, [targetKey]);
      params.set(targetKey, paramValue);
    });
    setLocalCreateOpen(next.kind === "create");
    setLocalEditId(next.kind === "edit" ? next.id : null);
    setLocalViewId(next.kind === "view" ? next.id : null);
    setLocalDeleteId(next.kind === "delete" ? next.id : null);
    setLocalBatchDeleteIds(next.kind === "batchDelete" ? next.ids : []);
    setLocalBatchDeleteItems(next.kind === "batchDelete" ? (next.items ?? []) : []);
  });

  const clearModalKeys = useMemoizedFn((keysToClear: string[], resetLocal: () => void) => {
    updateUrlParams((params) => {
      for (const key of keysToClear) {
        params.delete(key);
      }
    }, keysToClear);
    resetLocal();
  });

  const openCreate = useMemoizedFn(() => {
    activateModal({ kind: "create" });
    onOpenCreate?.();
  });

  const closeCreate = useMemoizedFn(() => {
    clearModalKeys([createKey], () => setLocalCreateOpen(false));
  });

  const openEdit = useMemoizedFn((id: string) => {
    activateModal({ kind: "edit", id });
    onOpenEdit?.(id);
  });

  const closeEdit = useMemoizedFn(() => {
    clearModalKeys([editKey], () => setLocalEditId(null));
  });

  const closeFormDialog = useMemoizedFn(() => {
    clearModalKeys([createKey, editKey], () => {
      setLocalCreateOpen(false);
      setLocalEditId(null);
    });
  });

  const openView = useMemoizedFn((id: string) => {
    activateModal({ kind: "view", id });
    onOpenView?.(id);
  });

  const closeView = useMemoizedFn(() => {
    clearModalKeys([viewKey], () => setLocalViewId(null));
  });

  const openDelete = useMemoizedFn((target: string | string[], items?: TData[]) => {
    if (Array.isArray(target)) {
      activateModal({ kind: "batchDelete", ids: target, items });
      onOpenBatchDelete?.(target, items);
    } else {
      activateModal({ kind: "delete", id: target });
      onOpenDelete?.(target);
    }
  });

  const openBatchDelete = useMemoizedFn((ids: string[], items?: TData[]) => {
    openDelete(ids, items);
  });

  const closeDelete = useMemoizedFn(() => {
    clearModalKeys([deleteKey, batchDeleteKey], () => {
      setLocalBatchDeleteIds([]);
      setLocalBatchDeleteItems([]);
      setLocalDeleteId(null);
    });
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

function useNextNavigationModalPort(): TableRouterPort {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const searchParams = useMemo(() => searchParamsToRecord(nextSearchParams), [nextSearchParams]);
  const latestSearchParamsRef = useRef<SearchParamsRecord>(searchParams);

  useEffect(() => {
    latestSearchParamsRef.current = searchParams;
  }, [searchParams]);

  const navigate = useMemoizedFn<TableRouterPort["navigate"]>((updater) => {
    if (typeof window === "undefined") return;
    const nextRecord = updater(latestSearchParamsRef.current);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(nextRecord)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }
    latestSearchParamsRef.current = searchParamsToRecord(params);
    const query = params.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(targetUrl, { scroll: false });
  });

  return useMemo(() => ({ searchParams, navigate }), [navigate, searchParams]);
}

/**
 * useResourceModalState:
 * Next.js App Router 集成版 CRUD 弹窗控制器 Hook：
 * 1. 无条件整合 `useRouter / useSearchParams / usePathname`；若在非 App Router 环境或需自定义 `TableRouterPort` 完全隔离，请直接使用 `useResourceModalStateWithPort`；
 * 2. 切换模态模式时自动互斥清理其余冲突参数，避免 `?create=true&editId=...` 并存；
 * 3. 统一单行删除与批量删除状态机，采用 ahooks useMemoizedFn 提供稳定回调引用。
 */
export function useResourceModalState<TData = unknown, TSearch = unknown>(
  options: Omit<UseResourceModalStateOptions<TData, TSearch>, "router"> = {},
): ResourceModalState<TData> {
  const nextRouterPort = useNextNavigationModalPort();

  return useResourceModalStateWithPort({
    ...options,
    router: nextRouterPort,
  });
}
