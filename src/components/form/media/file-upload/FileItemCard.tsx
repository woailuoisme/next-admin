"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { AlertCircle, CheckCircle2, Download, Eye, Loader2, Trash2 } from "lucide-react";
import { memo } from "react";
import { cn } from "cn";
import { sanitizeMediaUrl } from "@/components/shared/url";

import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import type { FileUploadItem } from "./types";

import { formatBytes, getFileIcon } from "./utils";

/**
 * 文件状态 → 语义化主题文案配色
 */
const FILE_STATUS_CLASSES = {
  done: "text-chart-2",
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
  const t = useTranslations("form");
  const isImage = file.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);
  const safeUrl = sanitizeMediaUrl(file.url, { allowDataImage: true });
  const canPreviewImage = isImage && Boolean(safeUrl) && file.status !== "error";

  const handlePreview = useMemoizedFn(() => {
    if (!canPreviewImage || !safeUrl) return;
    onPreview(safeUrl);
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
        {canPreviewImage && safeUrl ? (
          <img src={safeUrl} alt={file.name} className="size-full object-cover" />
        ) : (
          getFileIcon(file.type, file.name)
        )}

        {/* Uploading Spinner */}
        {file.status === "uploading" && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="text-primary size-4 animate-spin" aria-hidden="true" />
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
              <CheckCircle2 className="mr-0.5 size-3" aria-hidden="true" />
              {t("upload_status_success")}
            </span>
          )}
          {file.status === "error" && (
            <span className={cn("flex items-center", FILE_STATUS_CLASSES.error)}>
              <AlertCircle className="mr-0.5 size-3" aria-hidden="true" />
              {file.error || t("upload_status_failed")}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {file.status === "uploading" && <Progress value={file.progress ?? 30} className="h-1" />}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {canPreviewImage && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handlePreview}
            title={t("upload_preview")}
            aria-label={t("upload_preview")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Eye className="size-3.5" aria-hidden="true" />
          </Button>
        )}

        {showDownload && safeUrl && (
          <a
            href={safeUrl}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            title={t("upload_download")}
            aria-label={t("upload_download")}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "text-muted-foreground hover:text-foreground",
            )}
          >
            <Download className="size-3.5" aria-hidden="true" />
          </a>
        )}

        {showRemove && !disabled && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRemove}
            title={t("upload_remove")}
            aria-label={t("upload_remove")}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
});
