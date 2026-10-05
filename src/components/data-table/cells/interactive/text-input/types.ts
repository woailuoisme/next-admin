import type React from "react";
import type { z } from "zod";

import type { BaseCellProps } from "../../base";

export interface TextInputCellProps<TData = any> extends BaseCellProps {
  /** 当前文本值 */
  value: string | number | null;
  /** 当前行数据对象 */
  row: TData;
  /** 变更提交事件回调 (Enter 或 Blur 触发) */
  onCellChange?: (row: TData, nextValue: string) => Promise<void | boolean> | void;
  /** 输入框类型，默认 'text' */
  type?: "text" | "number" | "email" | "password" | "url";
  /** 移动端/软键盘输入模式 */
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** 输入框占位符 */
  placeholder?: string;
  /** 前缀插槽 */
  prefix?: React.ReactNode;
  /** 后缀插槽 */
  suffix?: React.ReactNode;
  /** Zod 校验规则 Schema（自动支持 Zod 原生国际化） */
  schema?: z.ZodTypeAny;
  /** 自定义函数校验规则（返回错误字符串即表示校验不通过） */
  rules?: (val: string, row: TData) => string | undefined;
  /** 异步保存失败时是否触发全局 Toast 提示，默认 true */
  showErrorToast?: boolean;
  /** 自定义异步失败 Toast 错误文案或工厂函数 */
  errorToastMessage?: string | ((err: unknown) => string);
  /** 是否禁用 */
  disabled?: boolean;
}
