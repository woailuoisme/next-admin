import type { BaseInputProps } from "../../core";

export type RichEditorToolbarButton =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "link"
  | "horizontalRule"
  | "undo"
  | "redo";

export interface RichEditorInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /** 输出格式：支持 HTML（默认，对标 Filament 原生）或 Markdown */
  format?: "html" | "markdown";
  /** 占位提示文案 */
  placeholder?: string;
  /** 可选自定义工具栏按钮集 */
  toolbarButtons?: RichEditorToolbarButton[];
  /** 编辑区域最小高度，例如 "180px" 或 180 */
  minHeight?: string | number;
  /** 编辑区域最大高度 */
  maxHeight?: string | number;
  /** 额外的编辑器类名 */
  editorClassName?: string;
  readOnly?: boolean;
}

export const DEFAULT_TOOLBAR: RichEditorToolbarButton[] = [
  "bold",
  "italic",
  "strike",
  "code",
  "h2",
  "h3",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "link",
  "horizontalRule",
  "undo",
  "redo",
];
