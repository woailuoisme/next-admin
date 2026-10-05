import { useMemoizedFn } from "ahooks";
import { memo, useState } from "react";

import { cn } from "@/lib/utils";

import type { FileUploadCoreProps } from "./types";

import { AvatarUploader } from "./AvatarUploader";
import { DropzoneArea } from "./DropzoneArea";
import { FileItemCard } from "./FileItemCard";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { useFileUpload } from "./useFileUpload";

export const FileUploadCore = memo(function FileUploadCore({
  id,
  value,
  onChange,
  onBlur,
  mode = "grid",
  accept,
  multiple,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  showDownload = true,
  showRemove = true,
  onUpload,
  disabled,
  readOnly,
  hasError,
  className,
}: FileUploadCoreProps) {
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const {
    items,
    isDragging,
    canUploadMore,
    fileInputRef,
    openFileDialog,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemove,
  } = useFileUpload({
    value,
    onChange,
    onBlur,
    mode,
    accept,
    multiple,
    maxFiles,
    maxSize,
    disabled,
    readOnly,
    onUpload,
  });

  const handlePreview = useMemoizedFn((url: string) => {
    setPreviewModalUrl(url);
  });

  const handleClosePreview = useMemoizedFn(() => {
    setPreviewModalUrl(null);
  });

  if (mode === "avatar") {
    return (
      <>
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept || "image/*"}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || readOnly}
        />
        <AvatarUploader
          currentAvatar={items[0]}
          isDragging={isDragging}
          hasError={hasError}
          disabled={disabled}
          readOnly={readOnly}
          canUploadMore={canUploadMore}
          onChooseFile={openFileDialog}
          onRemove={handleRemove}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={className}
        />
      </>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || readOnly}
      />

      {canUploadMore && (
        <DropzoneArea
          isDragging={isDragging}
          hasError={hasError}
          disabled={disabled}
          accept={accept}
          maxSize={maxSize}
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {items.map((file) => (
            <FileItemCard
              key={file.id}
              file={file}
              showDownload={showDownload}
              showRemove={showRemove}
              disabled={disabled}
              readOnly={readOnly}
              onPreview={handlePreview}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <ImageLightboxModal url={previewModalUrl} onClose={handleClosePreview} />
    </div>
  );
});
