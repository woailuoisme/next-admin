import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_SIZE,
  type FileValueCodec,
  type UploadTransport,
  type UploadTransportResult,
  createLegacyUploadTransport,
  mergeUploadedItems,
  normalizeUploadResult,
  resolveFileCodec,
  validateCandidateFiles,
} from "./pipeline";
import type { FileUploadItem } from "./types";
import { formatBytes } from "./utils";

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
  onUpload?: (file: File) => Promise<UploadTransportResult>;
  transport?: UploadTransport;
  valueCodec?: "item" | "url" | FileValueCodec;
}

export function useFileUpload({
  value,
  onChange,
  onBlur,
  mode = "grid",
  accept,
  multiple,
  maxFiles = DEFAULT_MAX_FILES,
  maxSize = DEFAULT_MAX_SIZE,
  disabled,
  readOnly,
  onUpload,
  transport,
  valueCodec,
}: UseFileUploadOptions) {
  const t = useTranslations("form");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const removedIdsRef = useRef<Set<string>>(new Set());
  const seqRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [transientItems, setTransientItems] = useState<FileUploadItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const transientItemsRef = useRef<FileUploadItem[]>([]);

  const codec = useMemo(() => resolveFileCodec(valueCodec), [valueCodec]);
  const committedItems = useMemo(() => codec.decode(value), [codec, value]);

  const latestCommittedRef = useRef<FileUploadItem[]>(committedItems);
  useEffect(() => {
    latestCommittedRef.current = committedItems;
  }, [committedItems]);

  const activeTransport = useMemo(() => transport ?? createLegacyUploadTransport(onUpload), [transport, onUpload]);

  const setDraggingTrue = useMemoizedFn(() => setIsDragging(true));
  const setDraggingFalse = useMemoizedFn(() => setIsDragging(false));

  const revokeBlobUrl = useMemoizedFn((url?: string) => {
    if (url && blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  });

  const updateTransient = useMemoizedFn((updater: (prev: FileUploadItem[]) => FileUploadItem[]) => {
    const next = updater(transientItemsRef.current);
    transientItemsRef.current = next;
    setTransientItems(next);
    return next;
  });

  // Revoke blob URLs and abort in-flight requests on unmount to prevent memory leaks
  useEffect(() => {
    const blobUrls = blobUrlsRef.current;
    const controllers = controllersRef.current;
    return () => {
      for (const controller of controllers.values()) {
        controller.abort();
      }
      controllers.clear();
      for (const url of blobUrls) {
        URL.revokeObjectURL(url);
      }
      blobUrls.clear();
    };
  }, []);

  const items = useMemo(() => {
    const transientIds = new Set(transientItems.map((item) => item.id));
    const committedWithoutTransient = committedItems.filter((item) => !transientIds.has(item.id));
    if (mode === "avatar") {
      return transientItems.length > 0 ? [transientItems[0]] : committedWithoutTransient.slice(0, 1);
    }
    return [...committedWithoutTransient, ...transientItems];
  }, [committedItems, transientItems, mode]);

  const activeItemCount = useMemo(() => items.filter((item) => item.status !== "error").length, [items]);

  const canUploadMore =
    !disabled && !readOnly && (mode === "avatar" ? activeItemCount === 0 : !multiple || activeItemCount < maxFiles);

  const formatRejectionMessage = useMemoizedFn((reason: "type" | "size" | "limit") => {
    if (reason === "type") return t("upload_error_type_not_allowed");
    if (reason === "size") return t("upload_error_exceed_size", { size: formatBytes(maxSize) });
    return t("upload_error_max_files", { count: maxFiles });
  });

  const triggerUploadFiles = useMemoizedFn(async (files: File[]) => {
    if (disabled || readOnly || files.length === 0) return;
    setValidationError(null);

    const activeCount =
      mode === "avatar"
        ? 0
        : latestCommittedRef.current.length +
          transientItemsRef.current.filter((item) => item.status === "uploading").length;

    const { accepted, rejected } = validateCandidateFiles(files, {
      accept,
      maxSize,
      maxFiles,
      currentCount: activeCount,
      mode,
      multiple,
    });

    const failedCards: FileUploadItem[] = [];
    const rejectionMessages = new Set<string>();
    for (const candidate of rejected) {
      const msg = formatRejectionMessage(candidate.reason);
      rejectionMessages.add(msg);
      if (mode === "grid" && (candidate.reason === "type" || candidate.reason === "size")) {
        seqRef.current += 1;
        failedCards.push({
          id: `rejected-${Date.now()}-${seqRef.current}-${candidate.file.name}`,
          name: candidate.file.name,
          size: candidate.file.size,
          url: "",
          type: candidate.file.type,
          status: "error",
          error: msg,
        });
      }
    }
    if (rejectionMessages.size > 0) {
      setValidationError(Array.from(rejectionMessages).join("; "));
    }

    if (accepted.length === 0) {
      if (failedCards.length > 0) {
        updateTransient((prev) => [...prev, ...failedCards]);
      }
      return;
    }

    const pendingPairs = accepted.map((file) => {
      seqRef.current += 1;
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(blobUrl);
      const pendingItem: FileUploadItem = {
        id: `uploading-${Date.now()}-${seqRef.current}-${file.name}`,
        name: file.name,
        size: file.size,
        url: blobUrl,
        type: file.type,
        progress: 10,
        status: "uploading",
      };
      return { file, blobUrl, pendingItem };
    });

    const pendingItems = pendingPairs.map((pair) => pair.pendingItem);

    updateTransient((prev) =>
      mode === "avatar" ? [...pendingItems, ...failedCards] : [...prev, ...pendingItems, ...failedCards],
    );

    await Promise.all(
      pendingPairs.map(async ({ file, blobUrl, pendingItem }) => {
        const controller = new AbortController();
        controllersRef.current.set(pendingItem.id, controller);

        try {
          const result = await activeTransport.upload(file, {
            signal: controller.signal,
            onProgress: (progress) => {
              if (removedIdsRef.current.has(pendingItem.id) || controller.signal.aborted) return;
              updateTransient((prev) => mergeUploadedItems(prev, pendingItem.id, { progress }));
            },
          });

          const normalized = normalizeUploadResult(result, file);

          if (removedIdsRef.current.has(pendingItem.id) || controller.signal.aborted) {
            revokeBlobUrl(blobUrl);
            if (normalized.url.startsWith("blob:") && normalized.url !== blobUrl) {
              URL.revokeObjectURL(normalized.url);
            }
            return;
          }

          // Release preview blob immediately when a distinct remote/final URL is returned;
          // register any new blob: result (e.g. local mock adapter) for later cleanup.
          if (normalized.url !== blobUrl) {
            revokeBlobUrl(blobUrl);
            if (normalized.url.startsWith("blob:")) {
              blobUrlsRef.current.add(normalized.url);
            }
          }

          const doneItem: FileUploadItem = {
            ...pendingItem,
            id: normalized.url || pendingItem.id,
            url: normalized.url,
            name: normalized.name,
            size: normalized.size,
            type: normalized.type,
            progress: 100,
            status: "done",
            error: undefined,
          };

          updateTransient((prev) => prev.filter((item) => item.id !== pendingItem.id));

          if (mode === "avatar") {
            for (const existing of latestCommittedRef.current) {
              if (existing.url && existing.url !== doneItem.url) {
                revokeBlobUrl(existing.url);
              }
            }
          }

          const nextCommitted =
            mode === "avatar"
              ? [doneItem]
              : [...latestCommittedRef.current.filter((item) => item.id !== doneItem.id), doneItem];
          latestCommittedRef.current = nextCommitted;
          onChange(codec.encode(nextCommitted, mode));
        } catch (err: unknown) {
          revokeBlobUrl(blobUrl);
          if (removedIdsRef.current.has(pendingItem.id) || controller.signal.aborted) {
            updateTransient((prev) => prev.filter((item) => item.id !== pendingItem.id));
            return;
          }
          const message = err instanceof Error && err.message ? err.message : t("upload_status_failed");
          updateTransient((prev) =>
            mergeUploadedItems(prev, pendingItem.id, {
              url: "",
              status: "error",
              error: message,
            }),
          );
        } finally {
          controllersRef.current.delete(pendingItem.id);
        }
      }),
    );

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
    setValidationError(null);
    removedIdsRef.current.add(idToRemove);

    const activeController = controllersRef.current.get(idToRemove);
    if (activeController) {
      activeController.abort();
      controllersRef.current.delete(idToRemove);
    }

    const transientTarget = transientItemsRef.current.find((item) => item.id === idToRemove);
    if (transientTarget?.url) {
      revokeBlobUrl(transientTarget.url);
    }
    if (transientTarget) {
      updateTransient((prev) => prev.filter((item) => item.id !== idToRemove));
    }

    const committedTarget = latestCommittedRef.current.find((item) => item.id === idToRemove);
    if (committedTarget?.url) {
      revokeBlobUrl(committedTarget.url);
    }

    if (committedTarget || mode === "avatar") {
      const nextCommitted = latestCommittedRef.current.filter((item) => item.id !== idToRemove);
      latestCommittedRef.current = nextCommitted;
      onChange(codec.encode(nextCommitted, mode));
    }

    onBlur?.();
  });

  const openFileDialog = useMemoizedFn(() => {
    if (disabled || readOnly) return;
    if (canUploadMore || mode === "avatar") {
      fileInputRef.current?.click();
    }
  });

  return {
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
    triggerUploadFiles,
  };
}
