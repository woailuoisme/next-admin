import type { BaseInputProps } from "../../core";

export interface RichEditorInputProps extends BaseInputProps {
  /** 受控值（Markdown 字符串） */
  value?: string;
  /** 非受控初始值（Markdown 字符串） */
  defaultValue?: string;
  /** 值变更回调（输出 Markdown 字符串） */
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /** 占位提示文案 */
  placeholder?: string;
  /** 编辑区域最小高度，例如 "180px" 或 180 */
  minHeight?: string | number;
  /** 编辑区域最大高度 */
  maxHeight?: string | number;
  /** 额外的编辑器类名 */
  editorClassName?: string;
  readOnly?: boolean;
}
