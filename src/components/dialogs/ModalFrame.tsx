"use client";

import { memo, type ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import type { DialogSize } from "./types";

import { FullscreenToggle } from "./FullscreenToggle";
import { useDialogFullscreen } from "./hooks/useDialogFullscreen";
import { getDialogContentClassName, getSheetContentClassName } from "./sizeClasses";

export interface ModalFrameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "dialog" | "sheet";
  size?: DialogSize;
  widthClassName?: string;
  className?: string;
  allowFullscreen?: boolean;
  fullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  headerSlot?: ReactNode;
  children: ReactNode;
}

/**
 * ModalFrame: Deep polymorphic overlay module consolidating shadcn Dialog and Sheet
 * behind a unified declarative seam with zero duplication of fullscreen and sizing state.
 */
export const ModalFrame = memo(function ModalFrame({
  open,
  onOpenChange,
  variant = "dialog",
  size = "md",
  widthClassName,
  className,
  allowFullscreen = false,
  fullscreen: controlledFullscreen,
  onFullscreenChange,
  title,
  description,
  headerSlot,
  children,
}: ModalFrameProps) {
  const { isFullscreen, toggleFullscreen } = useDialogFullscreen({
    open,
    fullscreen: controlledFullscreen,
    onFullscreenChange,
  });

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={getSheetContentClassName({ widthClassName, size, className })}>
          <SheetHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-16">
            {headerSlot || (
              <>
                {title ? <SheetTitle>{title}</SheetTitle> : <SheetTitle className="sr-only">Sheet</SheetTitle>}
                {description ? (
                  <SheetDescription className="text-muted-foreground text-xs leading-normal">
                    {description}
                  </SheetDescription>
                ) : null}
              </>
            )}
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={getDialogContentClassName({ isFullscreen, widthClassName, size, className })}>
        {allowFullscreen ? <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} /> : null}

        <DialogHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-16">
          {headerSlot || (
            <>
              {title ? <DialogTitle>{title}</DialogTitle> : <DialogTitle className="sr-only">Dialog</DialogTitle>}
              {description ? (
                <DialogDescription className="text-muted-foreground text-xs leading-normal">
                  {description}
                </DialogDescription>
              ) : null}
            </>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
});
