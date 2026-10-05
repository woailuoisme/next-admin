import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { memo, useEffect } from "react";

import { cn } from "@/lib/utils";

import type { RichEditorToolbarButton } from "./types";

import { simpleHtmlToMarkdown, simpleMarkdownToHtml } from "./converters";
import { RichEditorToolbar } from "./RichEditorToolbar";

export interface TipTapCoreProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  format: "html" | "markdown";
  placeholder?: string;
  toolbarButtons: RichEditorToolbarButton[];
  minHeight?: string | number;
  maxHeight?: string | number;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  className?: string;
}

export const TipTapCore = memo(function TipTapCore({
  id,
  value,
  onChange,
  onBlur,
  format,
  placeholder = "Write content here...",
  toolbarButtons,
  minHeight = 160,
  maxHeight,
  disabled,
  readOnly,
  hasError,
  className,
}: TipTapCoreProps) {
  const initialContent = format === "markdown" ? simpleMarkdownToHtml(value) : value;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
    ],
    content: initialContent,
    editable: !disabled && !readOnly,
    onUpdate: ({ editor: updatedEditor }) => {
      const html = updatedEditor.getHTML();
      if (format === "markdown") {
        onChange(simpleHtmlToMarkdown(html));
      } else {
        // TipTap 空内容时默认产出 <p></p>
        onChange(updatedEditor.isEmpty ? "" : html);
      }
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  // 同步外部受控值变化
  useEffect(() => {
    if (!editor || editor.isDestroyed || !editor.schema) return;
    // 编辑器聚焦编辑中时，说明变更源于内部用户输入，跳过重设以保留光标与选区
    if (editor.isFocused) return;
    const targetHtml = format === "markdown" ? simpleMarkdownToHtml(value || "") : value || "";
    try {
      const currentHtml = editor.getHTML();
      if (targetHtml !== currentHtml && (value !== "" || !editor.isEmpty)) {
        editor.commands.setContent(targetHtml, { emitUpdate: false });
      }
    } catch {
      // Ignore potential DOMSerializer / schema errors during rapid mount/unmount or JSDOM
    }
  }, [value, format, editor]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled && !readOnly);
    }
  }, [disabled, readOnly, editor]);

  if (!editor) {
    return (
      <div
        className="border-input bg-muted/20 text-muted-foreground flex items-center justify-center rounded-md border text-xs"
        style={{ minHeight }}
      >
        Loading editor...
      </div>
    );
  }

  const minHeightStyle = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const maxHeightStyle = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <div
      id={id}
      className={cn(
        "group relative flex flex-col rounded-md border border-input bg-background text-foreground shadow-xs transition-colors",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        hasError && "border-destructive focus-within:ring-destructive",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {/* Toolbar (对标 Filament v5 RichEditor 工具栏) */}
      {!readOnly && (
        <RichEditorToolbar editor={editor} toolbarButtons={toolbarButtons} disabled={disabled} />
      )}

      {/* TipTap Content Area */}
      <div
        className="relative overflow-y-auto px-3.5 py-2.5 text-sm"
        style={{
          minHeight: minHeightStyle,
          maxHeight: maxHeightStyle,
        }}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm max-w-none focus:outline-none dark:prose-invert",
            "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/60 [&_blockquote]:pl-3 [&_blockquote]:italic",
            "[&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs",
            "[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
          )}
        />
      </div>
    </div>
  );
});
