import type { ComponentType, ReactNode } from "react";

export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";

export type ColumnsCount = 1 | 2 | 3 | 4 | 6 | 12;

export interface ResponsiveColumns {
  sm?: ColumnsCount;
  md?: ColumnsCount;
  lg?: ColumnsCount;
  xl?: ColumnsCount;
}

export type GridColumns = ColumnsCount | ResponsiveColumns;

export interface FieldWrapperProps {
  /** 字段标签 */
  label?: ReactNode;
  /** 字段对齐方式 */
  align?: "left" | "center" | "right";
  /** 字段唯一标识 */
  id?: string;
  /** 是否必填，展示红色星号 */
  required?: boolean;
  /** 右上角说明或小徽标 */
  hint?: ReactNode;
  /** 底部辅助说明文字 */
  helperText?: ReactNode;
  /** 悬停说明气泡 Tooltip */
  tooltip?: ReactNode;
  /** 校验错误信息（字符串或数组），传入时覆盖自动绑定的错误 */
  error?: ReactNode;
  /** TanStack Form 字段元信息，自动提取 isTouched 与 errors */
  meta?: {
    isTouched?: boolean;
    errors?: unknown[];
  };
  /** 在网格中所占列数 */
  colSpan?: ColSpan;
  /** 外层容器类名 */
  className?: string;
  /** 是否隐藏整个字段容器 */
  hidden?: boolean;
  children?: ReactNode;
}

export interface BaseInputProps extends Omit<FieldWrapperProps, "children"> {
  /** 绑定在 TanStack Form 里的字段路径名 */
  name?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 显式传递的受控表单实例，如未传递则从 Form 上下文中自动获取 */
  form?: any;
}

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface ToggleButtonOption {
  label: ReactNode;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

export interface SegmentedOption<T = string | number> {
  label: ReactNode;
  value: T;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: ReactNode;
}
