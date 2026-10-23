import { useTranslations } from "next-intl";
import { Camera, Loader2 } from "lucide-react";
import { type DragEvent, memo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { FileUploadItem } from "./types";

interface AvatarUploaderProps {
  currentAvatar?: FileUploadItem;
  isDragging: boolean;
  hasError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
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
  canUploadMore,
  onChooseFile,
  onRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  className,
}: AvatarUploaderProps) {
  const t = useTranslations("form");

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => {
          if (canUploadMore) onChooseFile();
        }}
        className={cn(
          "group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all",
          isDragging
            ? "border-primary bg-primary/10 ring-2 ring-primary"
            : "border-border/80 bg-muted/30 hover:border-primary hover:bg-muted/50",
          hasError && "border-destructive",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {currentAvatar ? (
          <>
            <img src={currentAvatar.url} alt={currentAvatar.name} className="size-full object-cover" />
            {/* Hover Overlay */}
            {!disabled && !readOnly && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
                <span className="mt-1 text-[10px] font-medium text-white">{t("upload_avatar_change")}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center">
            <Camera className="text-muted-foreground/80 group-hover:text-primary size-6 transition-colors" />
            <span className="mt-1 text-[10px] font-medium">{t("upload_dropzone_title")}</span>
          </div>
        )}

        {currentAvatar?.status === "uploading" && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="text-primary size-5 animate-spin" />
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
