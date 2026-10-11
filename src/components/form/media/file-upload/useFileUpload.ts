import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";

import type { FileUploadItem } from "./types";

import { formatBytes, normalizeToItems } from "./utils";

export interface UseFileUploadOptions {
  value: unknown;
  onChange: (val: any) => void;
  onBlur?: () => void;
  mode?: "grid" | "avatar";
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  readOnly?: boolean;
  onUpload?: (file: File) => Promise<string | { url: string; name: string; size?: number }>;
}

export function useFileUpload({
  value,
  onChange,
  onBlur,
  mode = "grid",
  multiple,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  disabled,
  readOnly,
  onUpload,
}: UseFileUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const setDraggingTrue = useMemoizedFn(() => setIsDragging(true));
  const setDraggingFalse = useMemoizedFn(() => setIsDragging(false));

  // Revoke created blob URLs on unmount to prevent browser memory leaks
  useEffect(() => {
    const blobUrls = blobUrlsRef.current;
    return () => {
      for (const url of blobUrls) {
        URL.revokeObjectURL(url);
      }
      blobUrls.clear();
    };
  }, []);

  const items = normalizeToItems(value);

  const canUploadMore =
    !disabled && !readOnly && (mode === "avatar" ? items.length === 0 : !multiple || items.length < maxFiles);

  const triggerUploadFiles = useMemoizedFn(async (files: File[]) => {
    if (disabled || readOnly || files.length === 0) return;

    let validFiles = files;
    if (mode === "avatar") {
      validFiles = [files[0]];
    } else if (multiple && items.length + files.length > maxFiles) {
      validFiles = files.slice(0, Math.max(0, maxFiles - items.length));
    }

    const pendingItems: FileUploadItem[] = validFiles.map((file, idx) => {
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(blobUrl);
      return {
        id: `uploading-${Date.now()}-${idx}-${file.name}`,
        name: file.name,
        size: file.size,
        url: blobUrl,
        type: file.type,
        progress: 10,
        status: "uploading",
      };
    });

    let currentItems = mode === "avatar" ? pendingItems : [...items, ...pendingItems];
    onChange(mode === "avatar" ? currentItems[0] : currentItems);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const pendingId = pendingItems[i].id;

      try {
        if (file.size > maxSize) {
          throw new Error(`File exceeds max size (${formatBytes(maxSize)})`);
        }

        let uploadedUrl = "";
        let uploadedName = file.name;
        let uploadedSize = file.size;

        if (onUpload) {
          const result = await onUpload(file);
          if (typeof result === "string") {
            uploadedUrl = result;
          } else {
            uploadedUrl = result.url;
            uploadedName = result.name || file.name;
            uploadedSize = result.size || file.size;
          }
        } else {
          await new Promise((r) => setTimeout(r, 400));
          uploadedUrl = pendingItems[i].url;
        }

        currentItems = currentItems.map((item) =>
          item.id === pendingId
            ? {
                ...item,
                url: uploadedUrl,
                name: uploadedName,
                size: uploadedSize,
                progress: 100,
                status: "done",
              }
            : item,
        );
      } catch (err: any) {
        currentItems = currentItems.map((item) =>
          item.id === pendingId
            ? {
                ...item,
                status: "error",
                error: err?.message || "Upload failed",
              }
            : item,
        );
      }
      onChange(mode === "avatar" ? currentItems[0] : currentItems);
    }

    onBlur?.();
  });

  const handleFileSelect = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      triggerUploadFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  });

  const handleDragOver = useMemoizedFn((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !readOnly) {
      setDraggingTrue();
    }
  });

  const handleDragLeave = useMemoizedFn((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFalse();
  });

  const handleDrop = useMemoizedFn((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFalse();
    if (disabled || readOnly) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      triggerUploadFiles(files);
    }
  });

  const handleRemove = useMemoizedFn((idToRemove: string) => {
    if (disabled || readOnly) return;
    const target = items.find((item) => item.id === idToRemove);
    if (target?.url && target.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
      blobUrlsRef.current.delete(target.url);
    }
    const next = items.filter((item) => item.id !== idToRemove);
    onChange(mode === "avatar" ? null : next);
    onBlur?.();
  });

  const openFileDialog = useMemoizedFn(() => {
    if (canUploadMore) {
      fileInputRef.current?.click();
    }
  });

  return {
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
    triggerUploadFiles,
  };
}
