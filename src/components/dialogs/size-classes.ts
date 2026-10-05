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
