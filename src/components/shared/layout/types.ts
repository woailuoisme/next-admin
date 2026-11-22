import type { ComponentType, HTMLAttributes, ReactNode } from "react";

import type { GridColumns, GridGap } from "@/components/shared/grid";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** 列数或响应式断点配置 */
  columns?: GridColumns;
  /** 栅格间距 */
  gap?: GridGap;
  children?: ReactNode;
}

export interface SectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 区块标题 */
  title?: ReactNode;
  /** 区块描述文本 */
  description?: ReactNode;
  /** 标题左侧图标 */
  icon?: ReactNode;
  /** 标题栏右侧动作插槽 */
  action?: ReactNode;
  /** 是否支持折叠 */
  collapsible?: boolean;
  /** 默认是否折叠（仅在 collapsible 为 true 时生效） */
  defaultCollapsed?: boolean;
  /** 可选内容栅格列数 */
  columns?: GridColumns;
  /** 是否包裹在 Card 容器内（默认 true） */
  card?: boolean;
  /** 区块底部附加内容 */
  footer?: ReactNode;
  children?: ReactNode;
}

export interface FieldsetProps extends HTMLAttributes<HTMLFieldSetElement> {
  /** 分组标题 */
  legend?: ReactNode;
  /** 可选辅助说明 */
  description?: ReactNode;
  /** 可选内部栅格列数 */
  columns?: GridColumns;
  children?: ReactNode;
}

export interface LayoutTabItem {
  /** 标签页唯一值（与 id 二选一） */
  value?: string;
  /** 兼容 id 命名（等价于 value） */
  id?: string;
  /** 标签页显示标题 */
  label: ReactNode;
  /** 标签左侧图标（支持图标组件引用或 JSX 元素） */
  icon?: ReactNode | ComponentType<{ className?: string }>;
  /** 右侧徽标 */
  badge?: ReactNode;
  disabled?: boolean;
  /** 可选内容栅格列数 */
  columns?: GridColumns;
  children: ReactNode;
}

export interface TabsProps {
  tabs: LayoutTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}
