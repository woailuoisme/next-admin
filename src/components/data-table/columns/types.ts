import type { ActionItem } from "../cells/action/types";
import type { DataTableColDef } from "../core/types";

export type OmitRender<T> = Omit<DataTableColDef<T>, "field" | "headerName" | "renderCell" | "description">;

export interface CrudActionsConfig<T = unknown> {
  /** 查看操作回调 */
  onView?: (row: T) => void;
  /** 编辑操作回调 */
  onEdit?: (row: T) => void;
  /** 删除操作回调 */
  onDelete?: (row: T) => void;
  /** 查看按钮标签/提示，默认 'View' */
  viewLabel?: string;
  /** 编辑按钮标签/提示，默认 'Edit' */
  editLabel?: string;
  /** 删除按钮标签/提示，默认 'Delete' */
  deleteLabel?: string;
  /** 是否隐藏特定操作 */
  isViewHidden?: boolean | ((row: T) => boolean);
  isEditHidden?: boolean | ((row: T) => boolean);
  isDeleteHidden?: boolean | ((row: T) => boolean);
  /** 是否禁用特定操作 */
  isViewDisabled?: boolean | ((row: T) => boolean);
  isEditDisabled?: boolean | ((row: T) => boolean);
  isDeleteDisabled?: boolean | ((row: T) => boolean);
}

export type ActionsColOptions<T = unknown> = Omit<DataTableColDef<T>, "field" | "headerName" | "renderCell"> & {
  field?: string;
  headerName?: string;
  quickActions?: ActionItem<T>[];
  dropdownActions?: ActionItem<T>[];
  quick?: ActionItem<T>[];
  dropdown?: ActionItem<T>[];
  maxQuickActions?: number;
  moreActionsLabel?: string;
  /** 预置标准化 CRUD 操作配置 */
  crud?: CrudActionsConfig<T>;
};
