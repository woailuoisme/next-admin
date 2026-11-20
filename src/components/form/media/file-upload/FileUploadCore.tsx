"use client";

import { httpAdapter, type UploadAdapter, type UploadItem as UploadItemData } from "@uploadcn/core";
import { defaultMessages, useUploadContext, useUploader, useUploadSelector } from "@uploadcn/react";
import { CheckCircle2Icon, DownloadIcon, EyeIcon, Trash2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { AvatarUpload } from "./AvatarUpload";
import { isFocusLeaving } from "@/components/shared/focus";
import { sanitizeMediaUrl } from "@/components/shared/url";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Upload,
  UploadDropzone,
  UploadDropzoneDescription,
  UploadDropzoneHeader,
  UploadDropzoneMedia,
  UploadDropzonePasteHint,
  UploadDropzoneTitle,
  UploadItem,
  UploadItemActions,
  UploadItemCancel,
  UploadItemContent,
  UploadItemDescription,
  UploadItemError,
  UploadItemMedia,
  UploadItemProgress,
  UploadItemRemove,
  UploadItemRetry,
  UploadItemTitle,
  UploadList,
} from "@/components/ui/upload";
import { cn } from "cn";

import type { FileUploadCoreProps, FileUploadValue } from "./types";

/** 上传队列当前成功项 → 表单值（onSuccess 与 remove 事件两处共用） */
function buildFormValue(
  uploader: { getState: () => { items: readonly UploadItemData[] } },
  persistedUrls: string[],
  isSingleMode: boolean,
) {
  return formatFormValue(persistedUrls, collectSucceededUrls(uploader.getState().items), isSingleMode);
}
import {
  collectSucceededUrls,
  DEFAULT_LOCAL_ADAPTER,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_SIZE,
  formatBytes,
  formatFormValue,
  getFileIcon,
  getFileNameFromUrl,
  getItemResultUrl,
  isImageUrl,
  normalizeUrls,
  parseAllowedFileTypes,
} from "./utils";

const DynamicImageLightboxModal = dynamic(
  () => import("@/components/shared/ImageLightboxModal").then((mod) => mod.ImageLightboxModal),
  { ssr: false },
);

export function FileUploadCore({
  id,
  value,
  onChange,
  onBlur,
  mode = "grid",
  accept,
  multiple = true,
  maxFiles = DEFAULT_MAX_FILES,
  maxSize = DEFAULT_MAX_SIZE,
  adapter,
  endpoint,
  headers,
  paste = true,
  crop = true,
  showDownload = true,
  showRemove = true,
  disabled = false,
  readOnly = false,
  hasError = false,
  describedBy,
  className,
}: FileUploadCoreProps) {
  const isSingleMode = mode === "avatar" || !multiple || maxFiles === 1;
  const effectiveMaxFiles = isSingleMode ? 1 : maxFiles;
  const resolvedAccept = mode === "avatar" && !accept ? "image/*" : accept;
  const parsedAccept = parseAllowedFileTypes(resolvedAccept) ?? undefined;
  const resolvedAdapter = adapter ?? (endpoint ? httpAdapter({ url: endpoint, headers }) : DEFAULT_LOCAL_ADAPTER);
  const normalizedUrls = normalizeUrls(value);

  if (mode === "avatar") {
    return (
      <div className={cn("w-full", className)}>
        <AvatarUpload
          id={id}
          adapter={resolvedAdapter}
          src={normalizedUrls[0] ?? null}
          accept={parsedAccept ?? "image/*"}
          maxSize={maxSize}
          crop={crop}
          paste={paste}
          disabled={disabled}
          readOnly={readOnly}
          showRemove={showRemove}
          hasError={hasError}
          describedBy={describedBy}
          onBlur={onBlur}
          onChange={(item) => onChange(item ? getItemResultUrl(item) : "")}
        />
      </div>
    );
  }

  return (
    <GridUploadCore
      id={id}
      normalizedUrls={normalizedUrls}
      onChange={onChange}
      onBlur={onBlur}
      resolvedAdapter={resolvedAdapter}
      resolvedAccept={resolvedAccept}
      parsedAccept={parsedAccept}
      isSingleMode={isSingleMode}
      effectiveMaxFiles={effectiveMaxFiles}
      maxSize={maxSize}
      paste={paste}
      showDownload={showDownload}
      showRemove={showRemove}
      disabled={disabled}
      readOnly={readOnly}
      hasError={hasError}
      describedBy={describedBy}
      className={className}
    />
  );
}

interface GridUploadCoreProps {
  id: string;
  normalizedUrls: string[];
  onChange: (val: FileUploadValue | null) => void;
  onBlur?: () => void;
  resolvedAdapter: UploadAdapter<unknown>;
  resolvedAccept?: string;
  parsedAccept?: string[];
  isSingleMode: boolean;
  effectiveMaxFiles: number;
  maxSize: number;
  paste: boolean | "global";
  showDownload: boolean;
  showRemove: boolean;
  disabled: boolean;
  readOnly: boolean;
  hasError: boolean;
  describedBy?: string;
  className?: string;
}

function GridUploadCore({
  id,
  normalizedUrls,
  onChange,
  onBlur,
  resolvedAdapter,
  resolvedAccept,
  parsedAccept,
  isSingleMode,
  effectiveMaxFiles,
  maxSize,
  paste,
  showDownload,
  showRemove,
  disabled,
  readOnly,
  hasError,
  describedBy,
  className,
}: GridUploadCoreProps) {
  const t = useTranslations("form");
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const isInteractive = !disabled && !readOnly;
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

  // Sync external resets (e.g., form.reset()) back into the session uploader queue.
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

  const handleOpenPreview = (rawUrl: string) => {
    const safeUrl = sanitizeMediaUrl(rawUrl, { allowDataImage: true });
    if (safeUrl) setPreviewModalUrl(safeUrl);
  };

  const handleRemovePersisted = (targetUrl: string) => {
    const nextPersisted = persistedUrls.filter((url) => url !== targetUrl);
    onChange(formatFormValue(nextPersisted, uploadedUrls, isSingleMode));
  };

  const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (isFocusLeaving(event)) onBlur?.();
  };

  const previewImages = [...persistedUrls, ...uploadedUrls]
    .filter(isImageUrl)
    .map((url) => sanitizeMediaUrl(url, { allowDataImage: true }))
    .filter((url): url is string => Boolean(url));

  return (
    <div className={cn("w-full space-y-3", className)} onBlur={handleContainerBlur}>
      <Upload
        uploader={uploader}
        multiple={!isSingleMode}
        disabled={!isInteractive}
        paste={isInteractive ? paste : false}
        messages={{
          remove: (name) => `${t("upload_remove")} ${name}`,
          retry: (name) => `${t("upload_retry")} ${name}`,
          status: {
            ...defaultMessages.status,
            success: t("upload_status_success"),
            error: t("upload_status_failed"),
          },
        }}
      >
        {canUploadMore && (
          <UploadDropzone
            id={id}
            clickable={isInteractive}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cn(
              hasError && "border-destructive bg-destructive/5",
              !isInteractive && "pointer-events-none opacity-60",
            )}
          >
            <UploadDropzoneHeader>
              <UploadDropzoneMedia variant="icon" />
              <UploadDropzoneTitle>
                <span className="text-primary">{t("upload_dropzone_title")}</span> {t("upload_dropzone_desc")}
              </UploadDropzoneTitle>
              <UploadDropzoneDescription>
                {resolvedAccept ? t("upload_supported_formats", { accept: resolvedAccept }) : t("upload_all_formats")}{" "}
                {maxSize ? `(${t("upload_max_size_prefix")} ${formatBytes(maxSize)})` : null}
              </UploadDropzoneDescription>
              <UploadDropzonePasteHint />
            </UploadDropzoneHeader>
          </UploadDropzone>
        )}

        {persistedUrls.length > 0 && (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {persistedUrls.map((rawUrl) => (
              <PersistedFileCard
                key={rawUrl}
                rawUrl={rawUrl}
                isInteractive={isInteractive}
                showDownload={showDownload}
                showRemove={showRemove}
                onPreview={handleOpenPreview}
                onRemove={() => handleRemovePersisted(rawUrl)}
              />
            ))}
          </div>
        )}

        <UploadList className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {(item) => (
            <ActiveUploadItemRow
              key={item.id}
              item={item}
              isInteractive={isInteractive}
              showDownload={showDownload}
              showRemove={showRemove}
              onPreview={handleOpenPreview}
            />
          )}
        </UploadList>
      </Upload>

      {previewModalUrl && (
        <DynamicImageLightboxModal
          url={previewModalUrl}
          images={previewImages}
          onClose={() => setPreviewModalUrl(null)}
        />
      )}
    </div>
  );
}

function SharedMediaActions({
  safeUrl,
  fileName,
  canPreview,
  canDownload,
  onPreview,
}: {
  safeUrl?: string;
  fileName: string;
  canPreview: boolean;
  canDownload: boolean;
  onPreview: (url: string) => void;
}) {
  const t = useTranslations("form");

  return (
    <>
      {canPreview && safeUrl && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onPreview(safeUrl)}
          title={t("upload_preview")}
          aria-label={t("upload_preview")}
          className="text-muted-foreground hover:text-foreground"
        >
          <EyeIcon className="size-3.5" aria-hidden="true" />
        </Button>
      )}

      {canDownload && safeUrl && (
        <a
          href={safeUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          title={t("upload_download")}
          aria-label={t("upload_download")}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-xs" }),
            "text-muted-foreground hover:text-foreground",
          )}
        >
          <DownloadIcon className="size-3.5" aria-hidden="true" />
        </a>
      )}
    </>
  );
}

function PersistedFileCard({
  rawUrl,
  isInteractive,
  showDownload,
  showRemove,
  onPreview,
  onRemove,
}: {
  rawUrl: string;
  isInteractive: boolean;
  showDownload: boolean;
  showRemove: boolean;
  onPreview: (url: string) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("form");
  const safeUrl = sanitizeMediaUrl(rawUrl, { allowDataImage: true });
  const fileName = getFileNameFromUrl(rawUrl);
  const showThumb = Boolean(safeUrl) && isImageUrl(rawUrl);

  return (
    <div className="bg-card border-border/70 relative flex items-center gap-3 overflow-hidden rounded-lg border p-2.5 shadow-2xs">
      <div className="bg-muted/50 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {showThumb && safeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external or blob image URL verified via sanitizeMediaUrl
          <img src={safeUrl} alt={fileName} className="size-full object-cover" />
        ) : (
          getFileIcon(undefined, fileName)
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-foreground truncate text-xs font-medium" title={fileName}>
          {fileName}
        </p>
        <div className="text-chart-2 flex items-center text-[10px]">
          <CheckCircle2Icon className="mr-0.5 size-3" aria-hidden="true" />
          <span>{t("upload_status_success")}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <SharedMediaActions
          safeUrl={safeUrl}
          fileName={fileName}
          canPreview={showThumb}
          canDownload={showDownload}
          onPreview={onPreview}
        />

        {showRemove && isInteractive && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onRemove}
            title={t("upload_remove")}
            aria-label={t("upload_remove")}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ActiveUploadItemRow({
  item,
  isInteractive,
  showDownload,
  showRemove,
  onPreview,
}: {
  item: UploadItemData<unknown>;
  isInteractive: boolean;
  showDownload: boolean;
  showRemove: boolean;
  onPreview: (url: string) => void;
}) {
  const t = useTranslations("form");
  const { uploader } = useUploadContext();
  const uploadedUrl = getItemResultUrl(item);
  const safeUrl = sanitizeMediaUrl(uploadedUrl, { allowDataImage: true });
  const isDone = item.status === "success";
  const canPreview = isDone && Boolean(safeUrl) && isImageUrl(uploadedUrl);

  return (
    <UploadItem item={item} variant="outline" size="default">
      <UploadItemMedia />
      <UploadItemContent>
        <UploadItemTitle />
        <UploadItemDescription />
        <UploadItemError />
      </UploadItemContent>
      <UploadItemActions>
        <SharedMediaActions
          safeUrl={safeUrl}
          fileName={item.name}
          canPreview={canPreview}
          canDownload={showDownload && isDone}
          onPreview={onPreview}
        />

        {isInteractive && item.status === "error" && (
          <UploadItemRetry title={t("upload_retry")} onClick={() => uploader.retry(item.id)} />
        )}

        {isInteractive && (item.status === "uploading" || item.status === "queued") && <UploadItemCancel />}

        {showRemove && isInteractive && <UploadItemRemove title={t("upload_remove")} />}
      </UploadItemActions>
      <UploadItemProgress />
    </UploadItem>
  );
}
