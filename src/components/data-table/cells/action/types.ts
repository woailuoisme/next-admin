import type React from "react";
import type { BaseCellProps } from "../base";

export interface ActionItem<TData = unknown> {
  /** 唯一标识，用于稳定的 React Key，缺省优先使用 string 类型的 label */
  id?: string;
  /** 操作展示标签或组件，CRUD 预置操作缺省时将自动根据 i18n 字典渲染对应文案 */
  label?: React.ReactNode;
  /** 屏幕阅读器文本（当 label 为非纯字符串或复杂组件时建议提供） */
  ariaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: TData) => void;
  /** 危险操作（红色标亮） */
  destructive?: boolean;
  /** 禁用状态 */
  disabled?: boolean | ((row: TData) => boolean);
  /** 是否隐藏 */
  hidden?: boolean | ((row: TData) => boolean);
  /** 分割线 */
  separator?: boolean;
  /** 悬停提示 */
  tooltip?: React.ReactNode;
}

export interface ActionsCellProps<TData = unknown> extends BaseCellProps {
  row: TData;
  /** 常驻独立按钮操作列表（默认前 2 个） */
  quickActions?: ActionItem<TData>[];
  /** 折叠在下拉菜单中的动作列表 */
  dropdownActions?: ActionItem<TData>[];
  /** 最多常驻几个快捷按钮，其余自动折叠进入下拉菜单，默认 2 */
  maxQuickActions?: number;
  /** 更多操作按钮无障碍说明，缺省自动使用 table.actions_more 多语言文案 */
  moreActionsLabel?: string;
}
