"use client";

import { useTranslations } from "next-intl";
import { type Editor, useEditorState } from "@tiptap/react";

import { useMemoizedFn } from "ahooks";
import {
  Bold,
  Code,
  FileCode,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { memo } from "react";

import type { RichEditorToolbarButton as ToolbarButtonId } from "./types";

import { RichEditorLinkPopover } from "./RichEditorLinkPopover";
import { RichEditorToolbarItem } from "./RichEditorToolbarItem";
import type { MessageKeyOf } from "@/types/i18n";

interface RichEditorToolbarProps {
  editor: Editor;
  toolbarButtons: ToolbarButtonId[];
  disabled?: boolean;
}

interface ActionButtonDef {
  id: ToolbarButtonId;
  labelKey: MessageKeyOf<"form">;
  Icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

const INLINE_BUTTONS: ActionButtonDef[] = [
  {
    id: "bold",
    labelKey: "editor_bold",
    Icon: Bold,
    action: (ed) => ed.chain().focus().toggleBold().run(),
    isActive: (ed) => ed.isActive("bold"),
  },
  {
    id: "italic",
    labelKey: "editor_italic",
    Icon: Italic,
    action: (ed) => ed.chain().focus().toggleItalic().run(),
    isActive: (ed) => ed.isActive("italic"),
  },
  {
    id: "strike",
    labelKey: "editor_strike",
    Icon: Strikethrough,
    action: (ed) => ed.chain().focus().toggleStrike().run(),
    isActive: (ed) => ed.isActive("strike"),
  },
  {
    id: "code",
    labelKey: "editor_code",
    Icon: Code,
    action: (ed) => ed.chain().focus().toggleCode().run(),
    isActive: (ed) => ed.isActive("code"),
  },
];

const HEADING_BUTTONS: ActionButtonDef[] = [
  {
    id: "h2",
    labelKey: "editor_heading2",
    Icon: Heading2,
    action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (ed) => ed.isActive("heading", { level: 2 }),
  },
  {
    id: "h3",
    labelKey: "editor_heading3",
    Icon: Heading3,
    action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (ed) => ed.isActive("heading", { level: 3 }),
  },
];

const BLOCK_BUTTONS: ActionButtonDef[] = [
  {
    id: "bulletList",
    labelKey: "editor_bullet_list",
    Icon: List,
    action: (ed) => ed.chain().focus().toggleBulletList().run(),
    isActive: (ed) => ed.isActive("bulletList"),
  },
  {
    id: "orderedList",
    labelKey: "editor_ordered_list",
    Icon: ListOrdered,
    action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    isActive: (ed) => ed.isActive("orderedList"),
  },
  {
    id: "blockquote",
    labelKey: "editor_quote",
    Icon: Quote,
    action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    isActive: (ed) => ed.isActive("blockquote"),
  },
  {
    id: "codeBlock",
    labelKey: "editor_code_block",
    Icon: FileCode,
    action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    isActive: (ed) => ed.isActive("codeBlock"),
  },
];

const HISTORY_BUTTONS: ActionButtonDef[] = [
  {
    id: "undo",
    labelKey: "editor_undo",
    Icon: Undo2,
    action: (ed) => ed.chain().focus().undo().run(),
    isDisabled: (ed) => !ed.can().undo(),
  },
  {
    id: "redo",
    labelKey: "editor_redo",
    Icon: Redo2,
    action: (ed) => ed.chain().focus().redo().run(),
    isDisabled: (ed) => !ed.can().redo(),
  },
];

interface ToolbarActionItemProps {
  btn: ActionButtonDef;
  label: string;
  editor: Editor;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarActionItem = memo(function ToolbarActionItem({
  btn,
  label,
  editor,
  isActive,
  disabled,
}: ToolbarActionItemProps) {
  const handleClick = useMemoizedFn(() => {
    btn.action(editor);
  });

  return (
    <RichEditorToolbarItem label={label} isActive={isActive} disabled={disabled} onClick={handleClick}>
      <btn.Icon aria-hidden="true" className="size-3.5" />
    </RichEditorToolbarItem>
  );
});

type ToolbarEditorState = Partial<Record<ToolbarButtonId, boolean>> & {
  canUndo?: boolean;
  canRedo?: boolean;
};

function selectToolbarState({ editor }: { editor: Editor }): ToolbarEditorState {
  return {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    strike: editor.isActive("strike"),
    code: editor.isActive("code"),
    h2: editor.isActive("heading", { level: 2 }),
    h3: editor.isActive("heading", { level: 3 }),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    blockquote: editor.isActive("blockquote"),
    codeBlock: editor.isActive("codeBlock"),
    link: editor.isActive("link"),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

function resolveToolbarDisabled(btn: ActionButtonDef, editor: Editor, editorState: ToolbarEditorState | null): boolean {
  if (editorState && btn.id === "undo") return !editorState.canUndo;
  if (editorState && btn.id === "redo") return !editorState.canRedo;
  return Boolean(btn.isDisabled?.(editor));
}

function renderGroup(
  buttons: ActionButtonDef[],
  toolbarButtons: ToolbarButtonId[],
  editor: Editor,
  editorState: ToolbarEditorState | null,
  t: (key: MessageKeyOf<"form">) => string,
  disabled?: boolean,
) {
  return buttons
    .filter((btn) => toolbarButtons.includes(btn.id))
    .map((btn) => {
      const isActive = editorState ? Boolean(editorState[btn.id]) : Boolean(btn.isActive?.(editor));
      const btnDisabled = resolveToolbarDisabled(btn, editor, editorState);

      return (
        <ToolbarActionItem
          key={btn.id}
          btn={btn}
          label={t(btn.labelKey)}
          editor={editor}
          isActive={isActive}
          disabled={disabled || btnDisabled}
        />
      );
    });
}

const ToolbarDivider = memo(function ToolbarDivider() {
  return <div className="bg-border/80 mx-1 h-4 w-px" aria-hidden="true" />;
});

export const RichEditorToolbar = memo(function RichEditorToolbar({
  editor,
  toolbarButtons,
  disabled,
}: RichEditorToolbarProps) {
  const t = useTranslations("form");
  const editorState = useEditorState({
    editor,
    selector: selectToolbarState,
  });

  const hasInline = INLINE_BUTTONS.some((b) => toolbarButtons.includes(b.id));
  const hasHeading = HEADING_BUTTONS.some((b) => toolbarButtons.includes(b.id));
  const hasBlock = BLOCK_BUTTONS.some((b) => toolbarButtons.includes(b.id));
  const hasInsert = toolbarButtons.includes("link") || toolbarButtons.includes("horizontalRule");
  const hasHistory = HISTORY_BUTTONS.some((b) => toolbarButtons.includes(b.id));

  return (
    <div
      role="toolbar"
      aria-label={t("editor_placeholder")}
      className="border-border/60 bg-muted/40 text-muted-foreground flex flex-wrap items-center gap-0.5 border-b p-1.5"
    >
      {/* Inline group */}
      {hasInline && renderGroup(INLINE_BUTTONS, toolbarButtons, editor, editorState, t, disabled)}

      {hasInline && (hasHeading || hasBlock || hasInsert) && <ToolbarDivider />}

      {/* Headings group */}
      {hasHeading && renderGroup(HEADING_BUTTONS, toolbarButtons, editor, editorState, t, disabled)}

      {hasHeading && (hasBlock || hasInsert) && <ToolbarDivider />}

      {/* Block & list group */}
      {hasBlock && renderGroup(BLOCK_BUTTONS, toolbarButtons, editor, editorState, t, disabled)}

      {hasBlock && hasInsert && <ToolbarDivider />}

      {/* Insert group (Link Popover + Horizontal Rule) */}
      {toolbarButtons.includes("link") && (
        <RichEditorLinkPopover editor={editor} isLinked={Boolean(editorState?.link)} disabled={disabled} />
      )}

      {toolbarButtons.includes("horizontalRule") && (
        <RichEditorToolbarItem
          label={t("editor_horizontal_rule")}
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus aria-hidden="true" className="size-3.5" />
        </RichEditorToolbarItem>
      )}

      {/* Spacer */}
      <div className="ml-auto" />

      {/* History group */}
      {hasHistory && renderGroup(HISTORY_BUTTONS, toolbarButtons, editor, editorState, t, disabled)}
    </div>
  );
});
