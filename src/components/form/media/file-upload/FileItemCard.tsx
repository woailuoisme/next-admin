import { useMemoizedFn } from "ahooks";
import { AlertCircle, CheckCircle2, Download, Eye, Loader2, Trash2 } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { FileUploadItem } from "./types";

import { formatBytes, getFileIcon } from "./utils";

/**
 * 文件状态 → 文案配色（成功态功能色统一收敛于此表）
 */
const FILE_STATUS_CLASSES = {
  done: "text-emerald-600 dark:text-emerald-400",
  error: "text-destructive",
} as const;

interface FileItemCardProps {
  file: FileUploadItem;
  showDownload: boolean;
  showRemove: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onPreview: (url: string) => void;
  onRemove: (id: string) => void;
}

export const FileItemCard = memo(function FileItemCard({
  file,
  showDownload,
  showRemove,
  disabled,
  readOnly,
  onPreview,
  onRemove,
}: FileItemCardProps) {
  const isImage = file.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

  const handlePreview = useMemoizedFn(() => {
    onPreview(file.url);
  });

  const handleRemove = useMemoizedFn(() => {
    onRemove(file.id);
  });

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-lg border border-border/70 bg-card p-2.5 shadow-2xs transition-all hover:shadow-xs",
        file.status === "error" && "border-destructive/60 bg-destructive/5",
      )}
    >
      {/* Thumbnail or File Icon */}
      <div className="bg-muted/50 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {isImage ? (
          <img src={file.url} alt={file.name} className="size-full object-cover" />
        ) : (
          getFileIcon(file.type, file.name)
        )}

        {/* Uploading Spinner */}
        {file.status === "uploading" && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="text-primary size-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Info & Progress */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-foreground truncate text-xs font-medium" title={file.name}>
          {file.name}
        </p>
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
          <span>{formatBytes(file.size)}</span>
          {file.status === "done" && (
            <span className={cn("flex items-center", FILE_STATUS_CLASSES.done)}>
              <CheckCircle2 className="mr-0.5 size-3" />
              Ready
            </span>
          )}
          {file.status === "error" && (
            <span className={cn("flex items-center", FILE_STATUS_CLASSES.error)}>
              <AlertCircle className="mr-0.5 size-3" />
              {file.error || "Failed"}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {file.status === "uploading" && (
          <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${file.progress || 30}%` }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {isImage && (
          <button
            type="button"
            onClick={handlePreview}
            title="Preview"
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-md p-1 transition-colors"
          >
            <Eye className="size-3.5" />
          </button>
        )}

        {showDownload && (
          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            title="Download"
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-md p-1 transition-colors"
          >
            <Download className="size-3.5" />
          </a>
        )}

        {showRemove && !disabled && !readOnly && (
          <button
            type="button"
            onClick={handleRemove}
            title="Delete"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-md p-1 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
