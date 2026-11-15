"use client";

import dynamic from "next/dynamic";

export * from "./color-picker/colorUtils";
export type { ColorPickerInputProps } from "./color-picker/types";
export * from "./file-upload/pipeline";
export * from "./file-upload/types";
export * from "./rich-editor/converters";
export type { RichEditorInputProps, RichEditorToolbarButton } from "./rich-editor/types";

export const ColorPickerInput = dynamic(
  () => import("./color-picker/ColorPickerInput").then((mod) => mod.ColorPickerInput),
  { ssr: false },
);

export const ColorPickerContent = dynamic(
  () => import("./color-picker/ColorPickerContent").then((mod) => mod.ColorPickerContent),
  { ssr: false },
);

export const FileUploadInput = dynamic(
  () => import("./file-upload/FileUploadInput").then((mod) => mod.FileUploadInput),
  { ssr: false },
);

export const FileUploadCore = dynamic(() => import("./file-upload/FileUploadCore").then((mod) => mod.FileUploadCore), {
  ssr: false,
});

export const RichEditorInput = dynamic(
  () => import("./rich-editor/RichEditorInput").then((mod) => mod.RichEditorInput),
  { ssr: false },
);
