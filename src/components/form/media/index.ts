"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export {
  getNextPaletteIndex,
  HEX_COLOR_REGEX,
  isValidHexColor,
  normalizeHexInput,
  toSixDigitHex,
} from "./color-picker/colorUtils";
export { DEFAULT_COLOR_PRESETS, type ColorPickerInputProps } from "./color-picker/types";
export type { FileUploadCoreProps, FileUploadInputProps, FileUploadValue } from "./file-upload/types";
export { DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE, normalizeUrls } from "./file-upload/utils";
export type { RichEditorInputProps } from "./rich-editor/types";

export const ColorPickerInput = dynamic(
  () => import("./color-picker/ColorPickerInput").then((mod) => mod.ColorPickerInput),
  { ssr: false, loading: () => createElement(Skeleton, { className: "h-8 w-full rounded-lg" }) },
);

export const ColorPickerContent = dynamic(
  () => import("./color-picker/ColorPickerContent").then((mod) => mod.ColorPickerContent),
  { ssr: false, loading: () => createElement(Skeleton, { className: "h-48 w-56 rounded-lg" }) },
);

export const FileUploadInput = dynamic(
  () => import("./file-upload/FileUploadInput").then((mod) => mod.FileUploadInput),
  { ssr: false, loading: () => createElement(Skeleton, { className: "h-28 w-full rounded-lg" }) },
);

export const FileUploadCore = dynamic(() => import("./file-upload/FileUploadCore").then((mod) => mod.FileUploadCore), {
  ssr: false,
  loading: () => createElement(Skeleton, { className: "h-28 w-full rounded-lg" }),
});

export const RichEditorInput = dynamic(
  () => import("./rich-editor/RichEditorInput").then((mod) => mod.RichEditorInput),
  { ssr: false, loading: () => createElement(Skeleton, { className: "h-48 w-full rounded-lg" }) },
);
