"use client";

import { useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface ResourceModalController<TItem> {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isViewOpen: boolean;
  isFormOpen: boolean;
  editId: string | null;
  viewId: string | null;
  activeEditItem: TItem | null;
  activeViewItem: TItem | null;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openView: (id: string) => void;
  closeForm: () => void;
  closeView: () => void;
  handleFormOpenChange: (open: boolean) => void;
  handleViewOpenChange: (open: boolean) => void;
}

interface UseResourceModalStateOptions<TItem extends { id: string | number }> {
  rows: TItem[];
  syncModalWithUrl: boolean;
  modalParamKeys: { createKey: string; editKey: string; viewKey: string };
  urlState: Record<string, unknown>;
  setUrlState: (patch: Record<string, unknown>, options?: { history?: "push" | "replace" }) => Promise<unknown>;
  onOpenCreate?: () => void;
  onOpenEdit?: (id: string) => void;
  onOpenView?: (id: string) => void;
}

/**
 * 资源弹窗状态机：统一收口 URL 同步 (`nuqs`) 与本地态 (`useState`) 两种 Create / Edit / View 模态控制流。
 */
export function useResourceModalState<TItem extends { id: string | number }>({
  rows,
  syncModalWithUrl,
  modalParamKeys,
  urlState,
  setUrlState,
  onOpenCreate,
  onOpenEdit,
  onOpenView,
}: UseResourceModalStateOptions<TItem>): ResourceModalController<TItem> {
  const { createKey, editKey, viewKey } = modalParamKeys;
  const [localCreate, setLocalCreate] = useState(false);
  const [localEditId, setLocalEditId] = useState<string | null>(null);
  const [localViewId, setLocalViewId] = useState<string | null>(null);

  const isCreateOpen = syncModalWithUrl ? Boolean(urlState[createKey]) : localCreate;
  const editId = syncModalWithUrl ? (typeof urlState[editKey] === "string" ? urlState[editKey] : null) : localEditId;
  const viewId = syncModalWithUrl ? (typeof urlState[viewKey] === "string" ? urlState[viewKey] : null) : localViewId;
  const isEditOpen = Boolean(editId);
  const isViewOpen = Boolean(viewId);
  const isFormOpen = isCreateOpen || isEditOpen;

  const openCreate = useMemoizedFn(() => {
    onOpenCreate?.();
    if (syncModalWithUrl) {
      void setUrlState({ [createKey]: true, [editKey]: null }, { history: "push" });
    } else {
      setLocalEditId(null);
      setLocalCreate(true);
    }
  });

  const openEdit = useMemoizedFn((id: string) => {
    onOpenEdit?.(id);
    if (syncModalWithUrl) {
      void setUrlState({ [createKey]: null, [editKey]: id }, { history: "push" });
    } else {
      setLocalCreate(false);
      setLocalEditId(id);
    }
  });

  const openView = useMemoizedFn((id: string) => {
    onOpenView?.(id);
    if (syncModalWithUrl) {
      void setUrlState({ [viewKey]: id }, { history: "push" });
    } else {
      setLocalViewId(id);
    }
  });

  const closeForm = useMemoizedFn(() => {
    if (syncModalWithUrl) {
      void setUrlState({ [createKey]: null, [editKey]: null });
    } else {
      setLocalCreate(false);
      setLocalEditId(null);
    }
  });

  const closeView = useMemoizedFn(() => {
    if (syncModalWithUrl) {
      void setUrlState({ [viewKey]: null });
    } else {
      setLocalViewId(null);
    }
  });

  const handleFormOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) closeForm();
  });

  const handleViewOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) closeView();
  });

  const activeEditItem = editId ? (rows.find((row) => String(row.id) === String(editId)) ?? null) : null;
  const activeViewItem = viewId ? (rows.find((row) => String(row.id) === String(viewId)) ?? null) : null;

  return {
    isCreateOpen,
    isEditOpen,
    isViewOpen,
    isFormOpen,
    editId,
    viewId,
    activeEditItem,
    activeViewItem,
    openCreate,
    openEdit,
    openView,
    closeForm,
    closeView,
    handleFormOpenChange,
    handleViewOpenChange,
  };
}
