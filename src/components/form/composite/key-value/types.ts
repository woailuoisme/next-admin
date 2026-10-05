import type { ReactNode } from "react";

import type { BaseInputProps, KeyValuePair } from "../../core";

export type KeyValueMode = "table" | "raw";
export type KeyValueRawFormat = "json" | "env";
export type KeyValueOutput = "auto" | "record" | "array";

export interface KeyValueRowItem extends KeyValuePair {
  _id: string;
  isDuplicate?: boolean;
}

export interface KeyValueInputProps extends BaseInputProps {
  /** 支持普通对象字典或 KeyValuePair 有序数组 */
  value?: Record<string, string> | KeyValuePair[];
  defaultValue?: Record<string, string> | KeyValuePair[];
  /** 输出变更回调 */
  onChange?: (val: Record<string, string> | KeyValuePair[]) => void;
  onBlur?: () => void;

  /** 输出格式：auto 依据初始输入自动推导；record 输出字典；array 输出有序数组 */
  valueType?: KeyValueOutput;

  /** 键名与键值占位符 */
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  /** 列头标签 */
  keyLabel?: ReactNode;
  valueLabel?: ReactNode;

  /** 预设候选键名（用于输入提示） */
  keySuggestions?: string[];

  /** 是否允许编辑键名（为 false 时键名只读固定） */
  canEditKeys?: boolean;
  /** 是否支持敏感值/密码遮罩查看 */
  masked?: boolean;
  /** 是否允许键重名（为 false 时标红警示） */
  allowDuplicateKeys?: boolean;

  /** 是否启用 Raw 源码模式切换（JSON / .env 键值文本） */
  enableRawMode?: boolean;
  /** 默认 Raw 模式格式 */
  defaultRawFormat?: KeyValueRawFormat;

  /** 操作文案与空状态 */
  addButtonText?: string;
  emptyText?: string;
  canAdd?: boolean;
  canDelete?: boolean;
  reorderable?: boolean;
  maxItems?: number;
  minItems?: number;
}

export interface KeyValueInputInnerProps extends KeyValueInputProps {
  id: string;
}
