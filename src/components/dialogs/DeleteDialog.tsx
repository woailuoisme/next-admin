import { useMemoizedFn, useUnmountedRef } from "ahooks";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { memo, useState } from "react";

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
import { cn } from "@/lib/utils";

import type { DeleteDialogProps } from "./types";

export const DeleteDialog = memo(function DeleteDialog({
  open,
  onOpenChange,
  entityName = "Item",
  entityTitle,
  itemCount = 1,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  requireConfirmKeyword,
  confirmKeyword,
  autoFocusInput = true,
  isPending = false,
  onConfirm,
  className,
}: DeleteDialogProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [internalPending, setInternalPending] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setConfirmInput("");
      setInternalPending(false);
    }
  }

  const unmountedRef = useUnmountedRef();

  const isBatch = itemCount > 1;
  const isActionPending = isPending || internalPending;

  const targetKeyword =
    typeof requireConfirmKeyword === "string"
      ? requireConfirmKeyword
      : (confirmKeyword ?? "DELETE");

  const hasKeywordRequirement = Boolean(requireConfirmKeyword);

  const isKeywordMatched = hasKeywordRequirement
    ? confirmInput.trim().toUpperCase() === targetKeyword.trim().toUpperCase()
    : true;

  const resolvedTitle =
    title ?? (isBatch ? `Delete ${itemCount} ${entityName}s?` : `Delete ${entityName}?`);

  const resolvedDescription =
    description ??
    (isBatch ? (
      <>
        Are you sure you want to permanently delete{" "}
        <span className="text-foreground font-semibold">
          {itemCount} selected {entityName}s
        </span>
        ? This action cannot be undone.
      </>
    ) : entityTitle ? (
      <>
        Are you sure you want to delete{" "}
        <span className="text-foreground font-semibold">"{entityTitle}"</span>? This action cannot
        be undone.
      </>
    ) : (
      `Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`
    ));

  const resolvedConfirmText =
    confirmText ?? (isBatch ? `Delete ${itemCount} Items` : `Delete ${entityName}`);

  const handleConfirm = useMemoizedFn(async () => {
    if (!isKeywordMatched) return;
    try {
      setInternalPending(true);
      await onConfirm();
      if (!unmountedRef.current) {
        onOpenChange(false);
      }
    } finally {
      if (!unmountedRef.current) {
        setInternalPending(false);
      }
    }
  });

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (isActionPending) return;
    onOpenChange(nextOpen);
  });

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={cn("max-w-md sm:max-w-md", className)}>
        <AlertDialogHeader className="space-y-2">
          <div className="text-destructive flex items-center gap-2">
            <div className="bg-destructive/10 flex size-9 items-center justify-center rounded-full">
              {isBatch ? (
                <Trash2 className="text-destructive size-4" />
              ) : (
                <AlertTriangle className="text-destructive size-4" />
              )}
            </div>
            <AlertDialogTitle className="text-foreground text-lg font-semibold">
              {resolvedTitle}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-muted-foreground text-xs leading-relaxed">
            {resolvedDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Keyword Verification Input for High-Risk Actions */}
        {hasKeywordRequirement ? (
          <div className="space-y-1.5 pt-1 pb-2">
            <Label className="text-muted-foreground text-xs">
              Please type{" "}
              <span className="text-foreground font-mono font-bold">{targetKeyword}</span> to
              confirm deletion:
            </Label>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isKeywordMatched && !isActionPending) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              placeholder={targetKeyword}
              disabled={isActionPending}
              className="h-8 font-mono text-xs"
              autoFocus={autoFocusInput}
            />
          </div>
        ) : null}

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isActionPending}
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs"
          >
            {cancelText}
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
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            <span>{resolvedConfirmText}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
