import { useMemoizedFn } from "ahooks";
import { Edit, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { memo, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { ViewDialogProps } from "./types";

import { DIALOG_SIZE_CLASSES, SHEET_SIZE_CLASSES } from "./size-classes";

interface ViewHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  extraActions?: ReactNode;
  onEdit?: () => void;
  editText: ReactNode;
  TitleComponent: React.ComponentType<{ className?: string; children?: ReactNode }>;
  DescriptionComponent: React.ComponentType<{ className?: string; children?: ReactNode }>;
}

const ViewHeader = memo(function ViewHeader({
  title,
  description,
  badge,
  extraActions,
  onEdit,
  editText,
  TitleComponent,
  DescriptionComponent,
}: ViewHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 pr-6">
        <div className="flex items-center gap-2.5">
          <TitleComponent className="text-foreground text-lg font-semibold tracking-tight">
            {title}
          </TitleComponent>
          {badge ? <div>{badge}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          {extraActions ?? null}
          {onEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              <Edit className="size-3.5" />
              <span>{editText}</span>
            </Button>
          ) : null}
        </div>
      </div>
      {description ? (
        <DescriptionComponent className="text-muted-foreground text-xs leading-normal">
          {description}
        </DescriptionComponent>
      ) : null}
    </div>
  );
});

export const ViewDialog = memo(function ViewDialog({
  open,
  onOpenChange,
  variant = "dialog",
  size = "md",
  widthClassName,
  title,
  description,
  badge,
  loading = false,
  onEdit,
  editText = "Edit",
  closeText = "Close",
  extraActions,
  children,
  className,
  footerClassName,
  allowFullscreen = false,
  fullscreen: controlledFullscreen,
  onFullscreenChange,
}: ViewDialogProps) {
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setInternalFullscreen(false);
    }
  }

  const isFullscreen = controlledFullscreen ?? internalFullscreen;

  const toggleFullscreen = useMemoizedFn(() => {
    const next = !isFullscreen;
    if (controlledFullscreen === undefined) {
      setInternalFullscreen(next);
    }
    onFullscreenChange?.(next);
  });

  const handleClose = useMemoizedFn(() => {
    onOpenChange(false);
  });

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    onOpenChange(nextOpen);
  });

  const contentBody = loading ? (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="text-primary size-6 animate-spin" />
    </div>
  ) : (
    children
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            "flex flex-col gap-0 overflow-hidden p-0",
            widthClassName || SHEET_SIZE_CLASSES[size],
            className,
          )}
        >
          <SheetHeader className="border-border/60 border-b px-6 py-4">
            <ViewHeader
              title={title}
              description={description}
              badge={badge}
              extraActions={extraActions}
              onEdit={onEdit}
              editText={editText}
              TitleComponent={SheetTitle}
              DescriptionComponent={SheetDescription}
            />
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
            {contentBody}
          </div>

          <SheetFooter
            className={cn(
              "sticky bottom-0 z-10 m-0 flex shrink-0 flex-row items-center justify-end gap-2.5 border-t border-border/70 bg-muted/30 p-0 px-6 py-3.5 dark:bg-muted/15",
              footerClassName,
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-8.5 px-4 text-xs font-medium"
            >
              {closeText}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 transition-all duration-200",
          isFullscreen
            ? "h-[96vh] max-h-[96vh] w-[98vw] sm:max-w-[98vw]"
            : "max-h-[calc(100dvh-2.5rem)] sm:max-h-[88vh]",
          !isFullscreen && (widthClassName || DIALOG_SIZE_CLASSES[size]),
          className,
        )}
      >
        {allowFullscreen ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground absolute top-2.5 right-9 z-10"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Restore" : "Maximize"}
            aria-label={isFullscreen ? "Restore size" : "Maximize dialog"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        ) : null}

        <DialogHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-16">
          <ViewHeader
            title={title}
            description={description}
            badge={badge}
            extraActions={extraActions}
            onEdit={onEdit}
            editText={editText}
            TitleComponent={DialogTitle}
            DescriptionComponent={DialogDescription}
          />
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
          {contentBody}
        </div>

        <DialogFooter
          className={cn(
            "sticky bottom-0 z-10 m-0 flex shrink-0 flex-row items-center justify-end gap-2.5 border-t border-border/70 bg-muted/30 p-0 px-6 py-3.5 dark:bg-muted/15",
            footerClassName,
          )}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-8.5 px-4 text-xs font-medium"
          >
            {closeText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
