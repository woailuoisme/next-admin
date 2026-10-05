import type { ReactNode } from "react";

import type { BaseInputProps } from "../../core";

export type RepeaterLayout = "card" | "table" | "simple";

export interface RepeaterHeaderColumn {
  /** 列标题文字或自定义节点 */
  label: ReactNode;
  /** 宽度类名或 CSS 宽度（如 "w-32", "w-1/4", "150px"） */
  width?: string;
  className?: string;
  /** 是否必填，标记红色星号 */
  required?: boolean;
}

export interface RepeaterItemHelpers<T = unknown> {
  /** 当前条目索引 (0-based) */
  index: number;
  /** 总条目数 */
  totalItems: number;
  /** 是否为第一项 */
  isFirst: boolean;
  /** 是否为最后一项 */
  isLast: boolean;
  /** 当前是否折叠中 */
  isCollapsed: boolean;
  /** 当前项是否有校验错误 */
  hasError: boolean;
  /** 当前项的具体错误信息 */
  error?: string | string[];
  /** 上移本项 */
  moveUp: () => void;
  /** 下移本项 */
  moveDown: () => void;
  /** 删除本项 */
  remove: () => void;
  /** 克隆/复制本项 */
  duplicate: () => void;
  /** 切换折叠/展开 */
  toggleCollapse: () => void;
  /** 更新本项数据 */
  update: (val: T) => void;
}

export interface RepeaterGlobalHelpers<T = unknown> {
  /** 当前所有项数组 */
  items: T[];
  /** 新增项方法 */
  addItem: () => void;
  /** 展开所有项 */
  expandAll: () => void;
  /** 折叠所有项 */
  collapseAll: () => void;
  /** 是否允许新增项 */
  canAdd: boolean;
}

export interface RepeaterProps<T = unknown> extends BaseInputProps {
  value?: T[];
  defaultValue?: T[];
  onChange?: (items: T[]) => void;
  onBlur?: () => void;

  /** 视图布局形态：默认 "card" 卡片折叠流，"table" 紧凑表格明细行，"simple" 轻量描边流 */
  layout?: RepeaterLayout;
  /** Table 模式下的表格列头定义 */
  headers?: RepeaterHeaderColumn[];

  /** 创建新项时的工厂初始值函数 */
  createItem: () => T;
  /** 克隆单项的工厂函数（缺省时使用深拷贝） */
  cloneItem?: (item: T) => T;
  /** 项渲染函数 */
  renderItem: (
    item: T,
    index: number,
    updateItem: (val: T) => void,
    helpers: RepeaterItemHelpers<T>,
  ) => ReactNode;
  /** 项标题函数 */
  itemTitle?: (item: T, index: number) => ReactNode;
  /** 自定义项 Key 获取函数 */
  getItemKey?: (item: T, index: number) => string;

  /** 按钮与文案配置 */
  addButtonText?: string;
  emptyText?: string;
  /** 是否在空状态时展示新增按钮引导 */
  showEmptyAddButton?: boolean;

  /** 数量约束 */
  minItems?: number;
  maxItems?: number;

  /** 折叠控制 */
  collapsible?: boolean;
  /** 默认初始折叠状态 */
  defaultCollapsed?: boolean | ((item: T, index: number) => boolean);

  /** 重新排序与拖拽 */
  reorderable?: boolean;

  /** 权限与动作控制 */
  canAdd?: boolean | ((items: T[]) => boolean);
  canDelete?: boolean | ((item: T, index: number) => boolean);
  canDuplicate?: boolean;
  /** 删除时是否通过 inline Popover 二次确认，防止误删复杂表单 */
  confirmDelete?: boolean;

  /** 外部传入的子项错误映射表（按索引映射） */
  itemErrors?: Record<number, string | string[]>;
  /** 当出现错误时是否自动展开折叠项 */
  autoExpandOnError?: boolean;

  /** 表尾统计与摘要插槽（尤其适用于 Table 模式订单明细的合计栏） */
  renderSummary?: (items: T[]) => ReactNode;
  /** 头部右侧额外操作插槽 */
  renderExtraActions?: (helpers: RepeaterGlobalHelpers<T>) => ReactNode;
}
