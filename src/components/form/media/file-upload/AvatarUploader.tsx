"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { type DragEvent, type KeyboardEvent, memo } from "react";

import { Button } from "@/components/ui/button";
import { sanitizeMediaUrl } from "@/components/shared/url";
import { cn } from "cn";

import type { FileUploadItem } from "./types";

interface AvatarUploaderProps {
  currentAvatar?: FileUploadItem;
  isDragging: boolean;
  hasError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  describedBy?: string;
  canUploadMore: boolean;
  onChooseFile: () => void;
  onRemove: (id: string) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  className?: string;
}

export const AvatarUploader = memo(function AvatarUploader({
  currentAvatar,
  isDragging,
  hasError,
  disabled,
  readOnly,
  describedBy,
  canUploadMore,
  onChooseFile,
  onRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  className,
}: AvatarUploaderProps) {
  const t = useTranslations("form");
  const isInteractive = !disabled && !readOnly;
  const isErrorAvatar = currentAvatar?.status === "error";
  const safeAvatarUrl = isErrorAvatar ? undefined : sanitizeMediaUrl(currentAvatar?.url, { allowDataImage: true });
  const hasPreviewImage = Boolean(safeAvatarUrl);

  const triggerUpload = () => {
    if (isInteractive && (canUploadMore || currentAvatar)) {
      onChooseFile();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerUpload();
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-disabled={!isInteractive || undefined}
        aria-describedby={describedBy}
        aria-label={currentAvatar ? t("upload_avatar_change") : t("upload_dropzone_title")}
        onKeyDown={handleKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerUpload}
        className={cn(
          "group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging
            ? "border-primary bg-primary/10 ring-2 ring-primary"
            : "border-border/80 bg-muted/30 hover:border-primary hover:bg-muted/50",
          (hasError || isErrorAvatar) && "border-destructive bg-destructive/5",
          !isInteractive && "cursor-not-allowed opacity-60",
        )}
      >
        {hasPreviewImage && currentAvatar && safeAvatarUrl ? (
          <>
            <img src={safeAvatarUrl} alt={currentAvatar.name} className="size-full object-cover" />
            {/* Hover Overlay */}
            {isInteractive && (
              <div className="bg-foreground/70 text-background absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5" aria-hidden="true" />
                <span className="mt-1 text-[10px] font-medium">{t("upload_avatar_change")}</span>
              </div>
            )}
          </>
        ) : isErrorAvatar ? (
          <div className="text-destructive flex flex-col items-center justify-center px-2 text-center">
            <AlertCircle className="size-5" aria-hidden="true" />
            <span className="mt-1 line-clamp-1 text-[10px] font-medium">{t("upload_status_failed")}</span>
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center">
            <Camera
              className="text-muted-foreground/80 group-hover:text-primary size-6 transition-colors"
              aria-hidden="true"
            />
            <span className="mt-1 text-[10px] font-medium">{t("upload_dropzone_title")}</span>
          </div>
        )}

        {currentAvatar?.status === "uploading" && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="text-primary size-5 animate-spin" aria-hidden="true" />
          </div>
        )}
      </div>

      {currentAvatar && !disabled && !readOnly && (
        <div className="flex flex-col gap-1.5">
          <Button type="button" variant="outline" size="xs" onClick={onChooseFile} className="h-7 text-xs">
            {t("upload_avatar_change")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onRemove(currentAvatar.id)}
            className="text-destructive hover:bg-destructive/10 h-7 text-xs"
          >
            {t("upload_remove")}
          </Button>
        </div>
      )}
    </div>
  );
});
