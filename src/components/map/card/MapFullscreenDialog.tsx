import type { ReactNode } from "react";

import { memo } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MapFullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  fullscreenHeight?: string | number;
  children: ReactNode;
}

export const MapFullscreenDialog = memo(function MapFullscreenDialog({
  open,
  onOpenChange,
  title,
  description,
  fullscreenHeight = "calc(90vh - 80px)",
  children,
}: MapFullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
				DialogContent 基础样式含 `sm:max-w-sm`（带 sm: 变体）。裸类 `max-w-7xl` 与它不属于
				同一个合并组，cn 不会把它去掉 → ≥640px 时对话框被压到 24rem(384px)，
				`w-[95vw]` / `max-w-7xl` 全部失效，地图被挤成窄条。故必须再显式补一个
				`sm:max-w-7xl` 才能覆盖。
				另：基础为 `grid`，而 `flex-1` 对 grid item 无效 → 地图体只能靠固定高度，
				会与 header/padding 叠加超出 92vh 被裁。改为 `flex flex-col` 让地图体真正
				占满剩余高度（`min-h-0` 解除 flex item 的最小高度约束）。
			*/}
      <DialogContent
        className="flex max-h-[95vh] w-[95vw] max-w-7xl flex-col overflow-hidden p-6 sm:max-w-7xl"
        style={{ height: "92vh" }}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span>{title}</span>
            <span className="border-primary/20 bg-primary/10 text-primary rounded-md border px-2 py-0.5 text-xs font-normal">
              全屏聚焦视图
            </span>
          </DialogTitle>
          {description ? <DialogDescription className="text-xs">{description}</DialogDescription> : null}
        </DialogHeader>

        <div
          className="border-border/60 relative mt-2 min-h-0 w-full flex-1 overflow-hidden rounded-lg border"
          style={{ maxHeight: fullscreenHeight }}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
});
