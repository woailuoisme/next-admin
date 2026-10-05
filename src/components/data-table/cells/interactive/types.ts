import type React from "react";

import type { BaseCellProps } from "../base";

export type { TextInputCellProps } from "./text-input/types";

// ==========================================
// ToggleCell Props (行内即时开关)
// ==========================================
export interface ToggleCellProps<TData = any> extends BaseCellProps {
  /** 开关布尔值 */
  checked?: boolean;
  /** 当前行数据对象 */
  row: TData;
  /** 切换事件回调（返回 Promise 时自动接管 loading 状态与失败回滚） */
  onCellChange?: (row: TData, nextChecked: boolean) => Promise<void | boolean> | void;
  /** 兼容 onToggle 别名 */
  onToggle?: (row: TData, nextChecked: boolean) => Promise<void | boolean> | void;
  /** 异步保存失败时是否触发全局 Toast 提示，默认 true */
  showErrorToast?: boolean;
  /** 自定义异步失败 Toast 错误文案或工厂函数 */
  errorToastMessage?: string | ((err: unknown) => string);
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为只读（纯展示状态） */
  readOnly?: boolean;
}

// ==========================================
// SelectCell Props (行内即时下拉选择)
// ==========================================
export interface SelectCellOption<TVal = any> {
  label: React.ReactNode;
  value: TVal;
  disabled?: boolean;
}

export interface SelectCellProps<TData = any, TVal = any> extends BaseCellProps {
  /** 当前选择值 */
  value: TVal;
  /** 选项列表 */
  options: SelectCellOption<TVal>[];
  /** 当前行数据对象 */
  row: TData;
  /** 变更事件回调 */
  onCellChange?: (row: TData, nextValue: TVal) => Promise<void | boolean> | void;
  /** 异步保存失败时是否触发全局 Toast 提示，默认 true */
  showErrorToast?: boolean;
  /** 自定义异步失败 Toast 错误文案或工厂函数 */
  errorToastMessage?: string | ((err: unknown) => string);
  /** 是否禁用 */
  disabled?: boolean;
}

// ==========================================
// CheckboxCell Props (行内独立勾选框)
// ==========================================
export interface CheckboxCellProps<TData = any> extends BaseCellProps {
  /** 勾选布尔值 */
  checked?: boolean;
  /** 当前行数据对象 */
  row: TData;
  /** 变更事件回调 */
  onCellChange?: (row: TData, nextChecked: boolean) => Promise<void | boolean> | void;
  /** 异步保存失败时是否触发全局 Toast 提示，默认 true */
  showErrorToast?: boolean;
  /** 自定义异步失败 Toast 错误文案或工厂函数 */
  errorToastMessage?: string | ((err: unknown) => string);
  /** 是否禁用 */
  disabled?: boolean;
}
