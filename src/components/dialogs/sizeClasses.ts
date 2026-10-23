import { cn } from "@/lib/utils";

import type { DialogSize } from "./types";

/** Dialog（居中弹窗）尺寸 → 最大宽度类名 */
export const DIALOG_SIZE_CLASSES: Record<DialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  "2xl": "sm:max-w-5xl",
  "3xl": "sm:max-w-6xl",
  "4xl": "sm:max-w-7xl",
  "5xl": "sm:max-w-[90vw]",
  full: "sm:max-w-[96vw] h-[92vh] max-h-[92vh]",
};

/** Sheet（侧边抽屉）尺寸 → 最大宽度类名 */
export const SHEET_SIZE_CLASSES: Record<DialogSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-2xl",
  "2xl": "sm:max-w-3xl",
  "3xl": "sm:max-w-4xl",
  "4xl": "sm:max-w-5xl",
  "5xl": "sm:max-w-[75vw]",
  full: "sm:max-w-[90vw]",
};

/** 弹窗可滚动主体（表单字段 / 详情内容共用） */
export const DIALOG_BODY_CLASS = "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4";

/** 弹窗吸底操作栏（DialogFooter / SheetFooter 共用） */
export const DIALOG_FOOTER_CLASS =
  "sticky bottom-0 z-10 m-0 flex shrink-0 flex-row items-center justify-end gap-2.5 border-t border-border/70 bg-muted/30 p-0 px-6 py-3.5 dark:bg-muted/15";

/** DialogContent 外壳：全屏态与尺寸类二选一，自定义宽度优先于尺寸预设 */
export function getDialogContentClassName({
  isFullscreen,
  widthClassName,
  size,
  className,
}: {
  isFullscreen: boolean;
  widthClassName?: string;
  size: DialogSize;
  className?: string;
}): string {
  return cn(
    "flex flex-col gap-0 overflow-hidden p-0 transition-all duration-200",
    isFullscreen ? "h-[96vh] max-h-[96vh] w-[98vw] sm:max-w-[98vw]" : "max-h-[calc(100dvh-2.5rem)] sm:max-h-[88vh]",
    !isFullscreen && (widthClassName || DIALOG_SIZE_CLASSES[size]),
    className,
  );
}

/** SheetContent 外壳 */
export function getSheetContentClassName({
  widthClassName,
  size,
  className,
}: {
  widthClassName?: string;
  size: DialogSize;
  className?: string;
}): string {
  return cn("flex flex-col gap-0 overflow-hidden p-0", widthClassName || SHEET_SIZE_CLASSES[size], className);
}
