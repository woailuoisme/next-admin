"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn, useUnmountedRef } from "ahooks";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { memo, useId, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

import type { DeleteDialogProps } from "./types";

interface DeleteDialogContentPanelProps extends DeleteDialogProps {
  internalPending: boolean;
  onInternalPendingChange: (pending: boolean) => void;
}

const DeleteDialogContentPanel = memo(function DeleteDialogContentPanel({
  onOpenChange,
  entityName,
  entityTitle,
  itemCount = 1,
  title,
  description,
  confirmText,
  cancelText,
  requireConfirmKeyword,
  confirmKeyword,
  autoFocusInput = false,
  isPending = false,
  internalPending,
  onInternalPendingChange,
  onConfirm,
  className,
}: DeleteDialogContentPanelProps) {
  const t = useTranslations("dialog");
  const keywordInputId = useId();
  const [confirmInput, setConfirmInput] = useState("");
  const unmountedRef = useUnmountedRef();
  const confirmLockRef = useRef(false);

  const resolvedEntityName = entityName ?? t("default_entity");
  const isBatch = itemCount > 1;
  const isActionPending = isPending || internalPending;

  const targetKeyword =
    typeof requireConfirmKeyword === "string" ? requireConfirmKeyword : (confirmKeyword ?? t("delete_keyword"));

  const hasKeywordRequirement = Boolean(requireConfirmKeyword);

  const isKeywordMatched = hasKeywordRequirement
    ? confirmInput.trim().toUpperCase() === targetKeyword.trim().toUpperCase()
    : true;

  const resolvedTitle =
    title ??
    (isBatch
      ? t("delete_batch_title", { count: itemCount, entityName: resolvedEntityName })
      : t("delete_item_title", { entityName: resolvedEntityName }));

  const resolvedDescription =
    description ??
    (isBatch
      ? t("delete_batch_desc", { count: itemCount, entityName: resolvedEntityName })
      : entityTitle
        ? t("delete_item_desc", {
            entityName:
              typeof entityTitle === "string" ? t("delete_quoted_name", { name: entityTitle }) : resolvedEntityName,
          })
        : t("delete_item_desc", { entityName: resolvedEntityName }));

  const resolvedConfirmText = confirmText ?? t("delete_confirm_action");
  const resolvedCancelText = cancelText ?? t("cancel");

  const handleConfirm = useMemoizedFn(async () => {
    if (confirmLockRef.current || isActionPending || !isKeywordMatched) return;
    confirmLockRef.current = true;
    try {
      onInternalPendingChange(true);
      await onConfirm();
      if (!unmountedRef.current) {
        onOpenChange(false);
      }
    } finally {
      confirmLockRef.current = false;
      if (!unmountedRef.current) {
        onInternalPendingChange(false);
      }
    }
  });

  return (
    <AlertDialogContent className={cn("max-w-md sm:max-w-md", className)}>
      <AlertDialogHeader className="space-y-2">
        <div className="text-destructive flex items-center gap-2">
          <div className="bg-destructive/10 flex size-9 items-center justify-center rounded-full">
            {isBatch ? (
              <Trash2 className="text-destructive size-4" aria-hidden="true" />
            ) : (
              <AlertTriangle className="text-destructive size-4" aria-hidden="true" />
            )}
          </div>
          <AlertDialogTitle className="text-foreground text-lg font-semibold">{resolvedTitle}</AlertDialogTitle>
        </div>

        <AlertDialogDescription className="text-muted-foreground text-xs leading-relaxed">
          {resolvedDescription}
        </AlertDialogDescription>
      </AlertDialogHeader>

      {/* Keyword Verification Input for High-Risk Actions */}
      {hasKeywordRequirement ? (
        <div className="space-y-1.5 pt-1 pb-2">
          <Label htmlFor={keywordInputId} className="text-muted-foreground text-xs">
            {t("delete_keyword_prompt", { keyword: targetKeyword })}
          </Label>
          <Input
            id={keywordInputId}
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isKeywordMatched && !isActionPending) {
                e.preventDefault();
                handleConfirm();
              }
            }}
            placeholder={t("delete_keyword_placeholder", { keyword: targetKeyword })}
            disabled={isActionPending}
            className="h-8 font-mono text-xs"
            autoFocus={autoFocusInput}
          />
        </div>
      ) : null}

      <AlertDialogFooter className="gap-2 sm:gap-2">
        <AlertDialogCancel disabled={isActionPending} onClick={() => onOpenChange(false)} className="h-9 text-xs">
          {resolvedCancelText}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
          disabled={isActionPending || !isKeywordMatched}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 gap-1.5 text-xs disabled:opacity-50"
        >
          {isActionPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
          <span>{resolvedConfirmText}</span>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
});

export const DeleteDialog = memo(function DeleteDialog(props: DeleteDialogProps) {
  const { open, onOpenChange, isPending } = props;
  const [internalPending, setInternalPending] = useState(false);

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (isPending || internalPending) return;
    onOpenChange(nextOpen);
  });

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {open ? (
        <DeleteDialogContentPanel
          {...props}
          internalPending={internalPending}
          onInternalPendingChange={setInternalPending}
        />
      ) : null}
    </AlertDialog>
  );
});
