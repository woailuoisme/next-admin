"use client";

import { useTranslations } from "next-intl";
import type { Editor } from "@tiptap/react";

import { useMemoizedFn } from "ahooks";
import { Check, Link as LinkIcon, Unlink } from "lucide-react";
import { type ChangeEvent, type KeyboardEvent, memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { sanitizeRichEditorUrl } from "./converters";
import { RichEditorToolbarItem } from "./RichEditorToolbarItem";

export interface RichEditorLinkPopoverProps {
  editor: Editor;
  disabled?: boolean;
}

export const RichEditorLinkPopover = memo(function RichEditorLinkPopover({
  editor,
  disabled,
}: RichEditorLinkPopoverProps) {
  const t = useTranslations("form");
  const [open, setOpen] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const closePopover = useMemoizedFn(() => {
    setUrlError(null);
    setOpen(false);
  });
  const [url, setUrl] = useState("");

  const isLinked = editor.isActive("link");

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (nextOpen) {
      const existingUrl = editor.getAttributes("link").href || "";
      setUrl(existingUrl);
      setUrlError(null);
    }
    setOpen(nextOpen);
  });

  const handleApply = useMemoizedFn(() => {
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closePopover();
      return;
    }

    const safeUrl = sanitizeRichEditorUrl(trimmed);
    if (!safeUrl) {
      setUrlError(t("editor_link_invalid_url"));
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: safeUrl }).run();
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
        <RichEditorToolbarItem label={t("editor_link")} isActive={isLinked} disabled={disabled}>
          <LinkIcon className="size-3.5" />
        </RichEditorToolbarItem>
      </PopoverTrigger>

      <PopoverContent className="w-72 space-y-2.5 p-3" align="start">
        <div className="text-foreground flex items-center justify-between text-xs font-medium">
          <span>{t("editor_link")}</span>
          {isLinked && (
            <span className="text-muted-foreground max-w-[120px] truncate font-mono text-[10px]">
              {t("editor_link")}
            </span>
          )}
        </div>

        <Input
          value={url}
          onChange={(e) => {
            setUrlError(null);
            handleUrlChange(e);
          }}
          onKeyDown={handleKeyDown}
          aria-invalid={Boolean(urlError) || undefined}
          placeholder={t("editor_link_url_placeholder")}
          className="h-7 font-mono text-xs"
          autoFocus
        />

        {urlError && (
          <p role="alert" className="text-destructive text-[11px]">
            {urlError}
          </p>
        )}

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
              {t("editor_link_remove")}
            </Button>
          )}
          <Button type="button" size="xs" onClick={handleApply} className="h-6 px-2 text-[11px]">
            <Check className="mr-1 size-3" />
            {t("editor_link_apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});
