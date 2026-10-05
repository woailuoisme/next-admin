import {
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import type { FileUploadItem } from "./types";

/**
 * 文件类型分类 → 图标配色（业务功能状态色统一收敛于此表）
 */
const FILE_ICON_CLASSES = {
  image: "size-5 text-sky-500",
  pdf: "size-5 text-rose-500",
  spreadsheet: "size-5 text-emerald-500",
  archive: "size-5 text-amber-500",
  code: "size-5 text-primary",
  fallback: "size-5 text-muted-foreground",
} as const;

/**
 * 归一化外部传入项的最小结构（仅声明会被读取的字段）
 */
type LooseFileItem = Partial<FileUploadItem> & { url: string };

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

export function normalizeToItems(value: unknown): FileUploadItem[] {
  if (!value) return [];
  if (typeof value === "string") {
    return [
      {
        id: value,
        name: value.split("/").pop() || "uploaded-file",
        url: value,
        status: "done",
      },
    ];
  }
  if (Array.isArray(value)) {
    return value
      .map((item, idx): FileUploadItem | null => {
        if (typeof item === "string") {
          return {
            id: `${item}-${idx}`,
            name: item.split("/").pop() || `file-${idx + 1}`,
            url: item,
            status: "done",
          };
        }
        if (typeof item === "object" && item !== null && "url" in item) {
          const raw = item as LooseFileItem;
          return {
            id: raw.id || raw.url || `item-${idx}`,
            name: raw.name || "uploaded-file",
            size: raw.size,
            url: raw.url,
            type: raw.type,
            status: raw.status || "done",
          };
        }
        return null;
      })
      .filter((item): item is FileUploadItem => item !== null);
  }
  if (typeof value === "object" && value !== null && "url" in value) {
    const raw = value as LooseFileItem;
    return [
      {
        id: raw.id || raw.url,
        name: raw.name || "uploaded-file",
        size: raw.size,
        url: raw.url,
        status: "done",
      },
    ];
  }
  return [];
}
