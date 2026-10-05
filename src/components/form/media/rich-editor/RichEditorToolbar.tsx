import type { Editor } from "@tiptap/react";

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

interface RichEditorToolbarProps {
  editor: Editor;
  toolbarButtons: ToolbarButtonId[];
  disabled?: boolean;
}

interface ActionButtonDef {
  id: ToolbarButtonId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

const INLINE_BUTTONS: ActionButtonDef[] = [
  {
    id: "bold",
    label: "Bold",
    Icon: Bold,
    action: (ed) => ed.chain().focus().toggleBold().run(),
    isActive: (ed) => ed.isActive("bold"),
  },
  {
    id: "italic",
    label: "Italic",
    Icon: Italic,
    action: (ed) => ed.chain().focus().toggleItalic().run(),
    isActive: (ed) => ed.isActive("italic"),
  },
  {
    id: "strike",
    label: "Strikethrough",
    Icon: Strikethrough,
    action: (ed) => ed.chain().focus().toggleStrike().run(),
    isActive: (ed) => ed.isActive("strike"),
  },
  {
    id: "code",
    label: "Inline Code",
    Icon: Code,
    action: (ed) => ed.chain().focus().toggleCode().run(),
    isActive: (ed) => ed.isActive("code"),
  },
];

const HEADING_BUTTONS: ActionButtonDef[] = [
  {
    id: "h2",
    label: "Heading 2",
    Icon: Heading2,
    action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (ed) => ed.isActive("heading", { level: 2 }),
  },
  {
    id: "h3",
    label: "Heading 3",
    Icon: Heading3,
    action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (ed) => ed.isActive("heading", { level: 3 }),
  },
];

const BLOCK_BUTTONS: ActionButtonDef[] = [
  {
    id: "bulletList",
    label: "Bullet List",
    Icon: List,
    action: (ed) => ed.chain().focus().toggleBulletList().run(),
    isActive: (ed) => ed.isActive("bulletList"),
  },
  {
    id: "orderedList",
    label: "Ordered List",
    Icon: ListOrdered,
    action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    isActive: (ed) => ed.isActive("orderedList"),
  },
  {
    id: "blockquote",
    label: "Blockquote",
    Icon: Quote,
    action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    isActive: (ed) => ed.isActive("blockquote"),
  },
  {
    id: "codeBlock",
    label: "Code Block",
    Icon: FileCode,
    action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    isActive: (ed) => ed.isActive("codeBlock"),
  },
];

const HISTORY_BUTTONS: ActionButtonDef[] = [
  {
    id: "undo",
    label: "Undo",
    Icon: Undo2,
    action: (ed) => ed.chain().focus().undo().run(),
    isDisabled: (ed) => !ed.can().undo(),
  },
  {
    id: "redo",
    label: "Redo",
    Icon: Redo2,
    action: (ed) => ed.chain().focus().redo().run(),
    isDisabled: (ed) => !ed.can().redo(),
  },
];

interface ToolbarActionItemProps {
  btn: ActionButtonDef;
  editor: Editor;
  disabled?: boolean;
}

const ToolbarActionItem = memo(function ToolbarActionItem({
  btn,
  editor,
  disabled,
}: ToolbarActionItemProps) {
  const handleClick = useMemoizedFn(() => {
    btn.action(editor);
  });

  return (
    <RichEditorToolbarItem
      label={btn.label}
      isActive={btn.isActive?.(editor)}
      disabled={disabled || btn.isDisabled?.(editor)}
      onClick={handleClick}
    >
      <btn.Icon className="size-3.5" />
    </RichEditorToolbarItem>
  );
});

function renderGroup(
  buttons: ActionButtonDef[],
  toolbarButtons: ToolbarButtonId[],
  editor: Editor,
  disabled?: boolean,
) {
  return buttons
    .filter((btn) => toolbarButtons.includes(btn.id))
    .map((btn) => <ToolbarActionItem key={btn.id} btn={btn} editor={editor} disabled={disabled} />);
}

const ToolbarDivider = memo(function ToolbarDivider() {
  return <div className="bg-border/80 mx-1 h-4 w-px" aria-hidden="true" />;
});

export const RichEditorToolbar = memo(function RichEditorToolbar({
  editor,
  toolbarButtons,
  disabled,
}: RichEditorToolbarProps) {
  const hasInline = INLINE_BUTTONS.some((b) => toolbarButtons.includes(b.id));
  const hasHeading = HEADING_BUTTONS.some((b) => toolbarButtons.includes(b.id));
  const hasBlock = BLOCK_BUTTONS.some((b) => toolbarButtons.includes(b.id));
  const hasInsert = toolbarButtons.includes("link") || toolbarButtons.includes("horizontalRule");
  const hasHistory = HISTORY_BUTTONS.some((b) => toolbarButtons.includes(b.id));

  return (
    <div className="border-border/60 bg-muted/40 text-muted-foreground flex flex-wrap items-center gap-0.5 border-b p-1.5">
      {/* Inline group */}
      {hasInline && renderGroup(INLINE_BUTTONS, toolbarButtons, editor, disabled)}

      {hasInline && (hasHeading || hasBlock || hasInsert) && <ToolbarDivider />}

      {/* Headings group */}
      {hasHeading && renderGroup(HEADING_BUTTONS, toolbarButtons, editor, disabled)}

      {hasHeading && (hasBlock || hasInsert) && <ToolbarDivider />}

      {/* Block & list group */}
      {hasBlock && renderGroup(BLOCK_BUTTONS, toolbarButtons, editor, disabled)}

      {hasBlock && hasInsert && <ToolbarDivider />}

      {/* Insert group (Link Popover + Horizontal Rule) */}
      {toolbarButtons.includes("link") && (
        <RichEditorLinkPopover editor={editor} disabled={disabled} />
      )}

      {toolbarButtons.includes("horizontalRule") && (
        <RichEditorToolbarItem
          label="Horizontal Rule"
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-3.5" />
        </RichEditorToolbarItem>
      )}

      {/* Spacer */}
      <div className="ml-auto" />

      {/* History group */}
      {hasHistory && renderGroup(HISTORY_BUTTONS, toolbarButtons, editor, disabled)}
    </div>
  );
});
