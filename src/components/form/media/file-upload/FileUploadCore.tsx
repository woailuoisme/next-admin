"use client";

import dynamic from "next/dynamic";
import { useMemoizedFn } from "ahooks";
import { memo, useMemo, useState } from "react";

import { cn } from "cn";

import { AvatarUploader } from "./AvatarUploader";
import { DropzoneArea } from "./DropzoneArea";
import { FileItemCard } from "./FileItemCard";
import { DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE } from "./pipeline";
import type { FileUploadCoreProps } from "./types";
import { useFileUpload } from "./useFileUpload";

const IMAGE_EXTENSION_RE = /\.(jpg|jpeg|png|webp|svg|gif)$/i;

const DynamicImageLightboxModal = dynamic(
  () => import("@/components/shared/ImageLightboxModal").then((mod) => mod.ImageLightboxModal),
  { ssr: false },
);

export const FileUploadCore = memo(function FileUploadCore({
  id,
  value,
  onChange,
  onBlur,
  mode = "grid",
  accept,
  multiple,
  maxFiles = DEFAULT_MAX_FILES,
  maxSize = DEFAULT_MAX_SIZE,
  showDownload = true,
  showRemove = true,
  onUpload,
  transport,
  valueCodec,
  disabled,
  readOnly,
  hasError,
  describedBy,
  className,
}: FileUploadCoreProps) {
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const {
    items,
    isDragging,
    canUploadMore,
    validationError,
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
    transport,
    valueCodec,
  });

  const handlePreview = useMemoizedFn((url: string) => {
    setPreviewModalUrl(url);
  });

  const handleClosePreview = useMemoizedFn(() => {
    setPreviewModalUrl(null);
  });

  const resolvedAccept = mode === "avatar" ? accept || "image/*" : accept;
  const resolvedMultiple = mode === "avatar" ? false : multiple;

  const previewImages = useMemo(
    () =>
      items
        .filter((item) => item.url && (item.type?.startsWith("image/") || IMAGE_EXTENSION_RE.test(item.name)))
        .map((item) => item.url),
    [items],
  );

  return (
    <div className={cn("w-full space-y-3", mode === "avatar" && className, mode !== "avatar" && className)}>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={resolvedAccept}
        multiple={resolvedMultiple}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || readOnly}
      />

      {mode === "avatar" ? (
        <AvatarUploader
          currentAvatar={items[0]}
          isDragging={isDragging}
          hasError={hasError}
          disabled={disabled}
          readOnly={readOnly}
          describedBy={describedBy}
          canUploadMore={canUploadMore}
          onChooseFile={openFileDialog}
          onRemove={handleRemove}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ) : (
        <>
          {canUploadMore && (
            <DropzoneArea
              isDragging={isDragging}
              hasError={hasError}
              disabled={disabled}
              readOnly={readOnly}
              describedBy={describedBy}
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
        </>
      )}

      {validationError && (
        <p role="alert" className="text-destructive text-xs">
          {validationError}
        </p>
      )}

      {previewModalUrl && (
        <DynamicImageLightboxModal url={previewModalUrl} images={previewImages} onClose={handleClosePreview} />
      )}
    </div>
  );
});
