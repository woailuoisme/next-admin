import { memo, type ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ChartFullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  fullscreenHeight: number | string;
  children: ReactNode;
}

export const ChartFullscreenDialog = memo(function ChartFullscreenDialog({
  open,
  onOpenChange,
  title,
  description,
  fullscreenHeight,
  children,
}: ChartFullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 补 sm:max-w-5xl：DialogContent 基础含 sm:max-w-sm，裸 max-w-5xl 不在同一合并组内会被击败 */}
      <DialogContent className="max-w-5xl p-6 sm:max-w-5xl sm:rounded-xl">
        <DialogHeader className="pb-2">
          {title && <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>}
          {description && (
            <DialogDescription className="text-muted-foreground text-xs">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="w-full min-w-0 pt-2" style={{ height: fullscreenHeight }}>
          {open ? children : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});
