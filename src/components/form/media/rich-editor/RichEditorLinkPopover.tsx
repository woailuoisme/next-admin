import type { Editor } from "@tiptap/react";

import { useBoolean, useMemoizedFn } from "ahooks";
import { Check, Link as LinkIcon, Unlink } from "lucide-react";
import { type ChangeEvent, type KeyboardEvent, memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { RichEditorToolbarItem } from "./RichEditorToolbarItem";

export interface RichEditorLinkPopoverProps {
  editor: Editor;
  disabled?: boolean;
}

export const RichEditorLinkPopover = memo(function RichEditorLinkPopover({
  editor,
  disabled,
}: RichEditorLinkPopoverProps) {
  const [open, { set: setOpen, setFalse: closePopover }] = useBoolean(false);
  const [url, setUrl] = useState("");

  const isLinked = editor.isActive("link");

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (nextOpen) {
      const existingUrl = editor.getAttributes("link").href || "";
      setUrl(existingUrl);
    }
    setOpen(nextOpen);
  });

  const handleApply = useMemoizedFn(() => {
    let trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closePopover();
      return;
    }

    // Prevent dangerous pseudo-protocol injections (javascript:, vbscript:, data:)
    if (/^(javascript|vbscript|data):/i.test(trimmed)) {
      return;
    }

    // Auto-prefix https:// if missing scheme
    if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    closePopover();
  });

  const handleUnlink = useMemoizedFn(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closePopover();
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    } else if (e.key === "Escape") {
      closePopover();
    }
  });

  const handleUrlChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  });

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <RichEditorToolbarItem
          label={isLinked ? "Edit Link" : "Insert Link"}
          isActive={isLinked}
          disabled={disabled}
        >
          <LinkIcon className="size-3.5" />
        </RichEditorToolbarItem>
      </PopoverTrigger>

      <PopoverContent className="w-72 space-y-2.5 p-3" align="start">
        <div className="text-foreground flex items-center justify-between text-xs font-medium">
          <span>设置超链接</span>
          {isLinked && (
            <span className="text-muted-foreground max-w-[120px] truncate font-mono text-[10px]">
              已绑定
            </span>
          )}
        </div>

        <Input
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          className="h-7 font-mono text-xs"
          autoFocus
        />

        <div className="flex items-center justify-end gap-1.5 pt-1">
          {isLinked && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleUnlink}
              className="text-destructive hover:bg-destructive/10 h-6 px-2 text-[11px]"
            >
              <Unlink className="mr-1 size-3" />
              取消链接
            </Button>
          )}
          <Button type="button" size="xs" onClick={handleApply} className="h-6 px-2 text-[11px]">
            <Check className="mr-1 size-3" />
            应用
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});
