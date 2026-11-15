"use client";

import { File, FileArchive, FileCode, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";

export { normalizeToItems } from "./pipeline";

/**
 * 文件类型分类 → 语义化主题图标配色
 */
const FILE_ICON_CLASSES = {
  image: "size-5 text-chart-1",
  pdf: "size-5 text-destructive",
  spreadsheet: "size-5 text-chart-2",
  archive: "size-5 text-chart-4",
  code: "size-5 text-primary",
  fallback: "size-5 text-muted-foreground",
} as const;

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

export function getFileIcon(type?: string, name?: string) {
  const filename = (name || "").toLowerCase();
  const mime = (type || "").toLowerCase();

  if (mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|gif)$/.test(filename)) {
    return <ImageIcon className={FILE_ICON_CLASSES.image} />;
  }
  if (mime.includes("pdf") || filename.endsWith(".pdf")) {
    return <FileText className={FILE_ICON_CLASSES.pdf} />;
  }
  if (mime.includes("sheet") || mime.includes("excel") || /\.(xlsx|xls|csv)$/.test(filename)) {
    return <FileSpreadsheet className={FILE_ICON_CLASSES.spreadsheet} />;
  }
  if (mime.includes("zip") || mime.includes("archive") || /\.(zip|tar|gz|rar|7z)$/.test(filename)) {
    return <FileArchive className={FILE_ICON_CLASSES.archive} />;
  }
  if (
    mime.includes("json") ||
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    /\.(js|ts|tsx|json|html|css)$/.test(filename)
  ) {
    return <FileCode className={FILE_ICON_CLASSES.code} />;
  }
  return <File className={FILE_ICON_CLASSES.fallback} />;
}
