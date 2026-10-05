import { Edit2, Eye, Trash2 } from "lucide-react";

import type { ActionItem } from "../cells/action/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { ActionsColOptions } from "./types";

import { ActionsCell } from "../cells/action";

/**
 * 操作列构造器 (ActionsColumn)
 * 支持声明式 crud 预置配置以及原生 quickActions/dropdownActions
 */
export function actionsCol<TData = any>(
  options: ActionsColOptions<TData> = {},
): DataTableColDef<TData> {
  const {
    field = "actions",
    headerName = "操作",
    quickActions = options.quick,
    dropdownActions = options.dropdown,
    maxQuickActions,
    moreActionsLabel,
    crud,
    quick: _quick,
    dropdown: _dropdown,
    ...colDef
  } = options;

  const resolvedQuick: ActionItem<TData>[] = [...(quickActions ?? [])];
  const resolvedDropdown: ActionItem<TData>[] = [...(dropdownActions ?? [])];

  if (crud) {
    const {
      onView,
      viewLabel = "View",
      isViewHidden,
      isViewDisabled,
      onEdit,
      editLabel = "Edit",
      isEditHidden,
      isEditDisabled,
      onDelete,
      deleteLabel = "Delete",
      isDeleteHidden,
      isDeleteDisabled,
    } = crud;

    if (onView) {
      resolvedQuick.push({
        id: "crud-view",
        label: viewLabel,
        ariaLabel: viewLabel,
        icon: Eye,
        tooltip: viewLabel,
        onClick: onView,
        hidden: isViewHidden,
        disabled: isViewDisabled,
      });
    }
    if (onEdit) {
      resolvedQuick.push({
        id: "crud-edit",
        label: editLabel,
        ariaLabel: editLabel,
        icon: Edit2,
        tooltip: editLabel,
        onClick: onEdit,
        hidden: isEditHidden,
        disabled: isEditDisabled,
      });
    }
    if (onDelete) {
      resolvedDropdown.push({
        id: "crud-delete",
        label: deleteLabel,
        ariaLabel: deleteLabel,
        icon: Trash2,
        tooltip: deleteLabel,
        destructive: true,
        onClick: onDelete,
        hidden: isDeleteHidden,
        disabled: isDeleteDisabled,
      });
    }
  }

  const quickCount = Math.min(resolvedQuick.length, maxQuickActions ?? 2);
  const hasDropdown = resolvedDropdown.length > 0 || resolvedQuick.length > (maxQuickActions ?? 2);
  const totalButtons = quickCount + (hasDropdown ? 1 : 0);
  const calculatedWidth = Math.max(70, totalButtons * 36 + 28);
  const resolvedWidth = colDef.width ?? calculatedWidth;
  const resolvedMinWidth = colDef.minWidth ?? calculatedWidth;

  return {
    field,
    headerName,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    pinned: "right",
    width: resolvedWidth,
    minWidth: resolvedMinWidth,
    renderCell: ({ row }: DataTableRenderCellParams<TData>) => (
      <ActionsCell
        row={row}
        quickActions={resolvedQuick}
        dropdownActions={resolvedDropdown}
        maxQuickActions={maxQuickActions}
        moreActionsLabel={moreActionsLabel}
        align={colDef.align || "center"}
      />
    ),
    ...colDef,
  };
}
