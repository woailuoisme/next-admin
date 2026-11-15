"use client";

import type { ReactNode } from "react";

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

export interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  stayText: ReactNode;
  discardText: ReactNode;
  onConfirmDiscard: () => void;
}

/**
 * Shared confirmation modal for abandoning unsaved form edits in dialogs, sheets, and form pages.
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  title,
  description,
  stayText,
  discardText,
  onConfirmDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-8.5 text-xs">{stayText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDiscard}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8.5 text-xs"
          >
            {discardText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
