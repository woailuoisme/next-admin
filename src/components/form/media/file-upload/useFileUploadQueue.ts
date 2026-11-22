"use client";

import type { UploadAdapter, UploadItem as UploadItemData } from "@uploadcn/core";
import { useUploader, useUploadSelector } from "@uploadcn/react";
import { useEffect, useRef } from "react";

import { sanitizeMediaUrl } from "@/components/shared/url";

import type { FileUploadValue } from "./types";
import { collectSucceededUrls, formatFormValue, getItemResultUrl, isImageUrl } from "./utils";

function buildFormValue(
  uploader: { getState: () => { items: readonly UploadItemData[] } },
  persistedUrls: string[],
  isSingleMode: boolean,
) {
  return formatFormValue(persistedUrls, collectSucceededUrls(uploader.getState().items), isSingleMode);
}

export interface UseFileUploadQueueOptions {
  normalizedUrls: string[];
  resolvedAdapter: UploadAdapter<unknown>;
  parsedAccept?: string[];
  maxSize: number;
  effectiveMaxFiles: number;
  isSingleMode: boolean;
  onChange: (val: FileUploadValue | null) => void;
}

export function useFileUploadQueue({
  normalizedUrls,
  resolvedAdapter,
  parsedAccept,
  maxSize,
  effectiveMaxFiles,
  isSingleMode,
  onChange,
}: UseFileUploadQueueOptions) {
  const persistedUrlsRef = useRef<string[]>([]);
  const isSyncingFromValueRef = useRef(false);

  const uploader = useUploader({
    adapter: resolvedAdapter,
    accept: parsedAccept,
    maxSize,
    maxFiles: effectiveMaxFiles,
    onSuccess: (item) => {
      if (isSingleMode) {
        uploader.remove((existing) => existing.id !== item.id);
      }
      onChange(buildFormValue(uploader, persistedUrlsRef.current, isSingleMode));
    },
  });

  const activeItems = useUploadSelector(uploader, (state) => state.items);
  const uploadedUrls = collectSucceededUrls(activeItems);
  const uploadedUrlSet = new Set(uploadedUrls);
  const persistedUrls = normalizedUrls.filter((url) => !uploadedUrlSet.has(url));

  useEffect(() => {
    persistedUrlsRef.current = persistedUrls;
  }, [persistedUrls]);

  useEffect(() => {
    const externalUrlSet = new Set(normalizedUrls);
    const staleIds = uploader
      .getState()
      .items.filter((item) => item.status === "success")
      .filter((item) => {
        const url = getItemResultUrl(item);
        return Boolean(url) && !externalUrlSet.has(url);
      })
      .map((item) => item.id);

    if (staleIds.length > 0) {
      isSyncingFromValueRef.current = true;
      uploader.remove(staleIds);
      isSyncingFromValueRef.current = false;
    }
  }, [normalizedUrls, uploader]);

  useEffect(() => {
    return uploader.on("remove", ({ item }) => {
      if (isSyncingFromValueRef.current || item.status !== "success") return;
      onChange(buildFormValue(uploader, persistedUrlsRef.current, isSingleMode));
    });
  }, [isSingleMode, onChange, uploader]);

  const activeValidCount = activeItems.filter(
    (item) => item.status !== "rejected" && item.status !== "cancelled",
  ).length;
  const canUploadMore = persistedUrls.length + activeValidCount < effectiveMaxFiles;

  const handleRemovePersisted = (targetUrl: string) => {
    const nextPersisted = persistedUrls.filter((url) => url !== targetUrl);
    onChange(formatFormValue(nextPersisted, uploadedUrls, isSingleMode));
  };

  const previewImages = [...persistedUrls, ...uploadedUrls]
    .filter(isImageUrl)
    .map((url) => sanitizeMediaUrl(url, { allowDataImage: true }))
    .filter((url): url is string => Boolean(url));

  return {
    uploader,
    persistedUrls,
    canUploadMore,
    previewImages,
    handleRemovePersisted,
  };
}
