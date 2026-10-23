import { useTranslations } from "next-intl";
import { UploadCloud } from "lucide-react";
import { type DragEvent, memo } from "react";
import { cn } from "@/lib/utils";

import { formatBytes } from "./utils";

interface DropzoneAreaProps {
  isDragging: boolean;
  hasError?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  onClick: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
}

export const DropzoneArea = memo(function DropzoneArea({
  isDragging,
  hasError,
  disabled,
  accept,
  maxSize,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}: DropzoneAreaProps) {
  const t = useTranslations("form");

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 px-6 py-7 text-center transition-all",
        isDragging ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/80 hover:bg-muted/40",
        hasError && "border-destructive bg-destructive/5",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="bg-background ring-border/60 flex size-10 items-center justify-center rounded-full shadow-xs ring-1">
        <UploadCloud className="text-primary size-5" />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-foreground text-xs font-medium">
          <span className="text-primary hover:underline">{t("upload_dropzone_title")}</span>{" "}
          {isDragging ? t("upload_dropzone_active") : t("upload_dropzone_desc")}
        </p>
        <p className="text-muted-foreground text-[11px]">
          {accept ? `${t("upload_supported_formats")}: ${accept}` : t("upload_all_formats")}{" "}
          {maxSize && `(${t("upload_max_size_prefix")} ${formatBytes(maxSize)})`}
        </p>
      </div>
    </div>
  );
});
