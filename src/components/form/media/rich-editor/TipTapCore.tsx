"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { memo, useEffect, useMemo } from "react";

import { cn } from "cn";

import type { RichEditorToolbarButton } from "./types";

import { type RichEditorCodec, resolveRichEditorCodec } from "./converters";
import { RichEditorSkeleton } from "./RichEditorSkeleton";
import { RichEditorToolbar } from "./RichEditorToolbar";

export interface TipTapCoreProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  format: "html" | "markdown";
  codec?: RichEditorCodec;
  placeholder?: string;
  toolbarButtons: RichEditorToolbarButton[];
  minHeight?: string | number;
  maxHeight?: string | number;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  describedBy?: string;
  className?: string;
}

export const TipTapCore = memo(function TipTapCore({
  id,
  value,
  onChange,
  onBlur,
  format,
  codec: customCodec,
  placeholder,
  toolbarButtons,
  minHeight = 160,
  maxHeight,
  disabled,
  readOnly,
  hasError,
  describedBy,
  className,
}: TipTapCoreProps) {
  const t = useTranslations("form");
  const resolvedPlaceholder = placeholder ?? t("editor_placeholder");
  const activeCodec = useMemo(() => resolveRichEditorCodec(format, customCodec), [format, customCodec]);
  const initialContent = activeCodec.decode(value);

  const handleUpdate = useMemoizedFn((editorHtml: string, isEmpty: boolean) => {
    onChange(activeCodec.encode(editorHtml, isEmpty));
  });

  const handleEditorBlur = useMemoizedFn(() => {
    onBlur?.();
  });

  const editor = useEditor({
    // RichEditorInput loads TipTapCore via next/dynamic(..., { ssr: false }), so it only renders client-side.
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Placeholder.configure({
        placeholder: resolvedPlaceholder,
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
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        ...(hasError ? { "aria-invalid": "true" } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      handleUpdate(updatedEditor.getHTML(), updatedEditor.isEmpty);
    },
    onBlur: () => {
      handleEditorBlur();
    },
  });

  // 同步外部受控值变化与 ProseMirror 可访问属性
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          id,
          role: "textbox",
          "aria-multiline": "true",
          ...(hasError ? { "aria-invalid": "true" } : {}),
          ...(describedBy ? { "aria-describedby": describedBy } : {}),
        },
      },
    });
  }, [editor, id, hasError, describedBy]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || !editor.schema) return;
    if (editor.isFocused) return;
    const targetHtml = activeCodec.decode(value || "");
    try {
      const currentHtml = editor.getHTML();
      const same = activeCodec.isEqual ? activeCodec.isEqual(targetHtml, currentHtml) : targetHtml === currentHtml;
      if (!same && (value !== "" || !editor.isEmpty)) {
        editor.commands.setContent(targetHtml, { emitUpdate: false });
      }
    } catch {
      // Ignore potential DOMSerializer / schema errors during rapid mount/unmount or JSDOM
    }
  }, [value, activeCodec, editor]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled && !readOnly);
    }
  }, [disabled, readOnly, editor]);

  if (!editor) {
    return <RichEditorSkeleton minHeight={minHeight} className={className} />;
  }

  const minHeightStyle = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const maxHeightStyle = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-md border border-input bg-background text-foreground shadow-xs transition-colors",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        hasError && "border-destructive focus-within:ring-destructive",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {!readOnly && <RichEditorToolbar editor={editor} toolbarButtons={toolbarButtons} disabled={disabled} />}

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
