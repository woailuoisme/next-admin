"use client";

import * as React from "react";
import { type UploadAdapter, type UploadItem, type ValidationOptions } from "@uploadcn/core";
import { Upload as UploadPrimitive, useUploadContext, useUploader, useUploadSelector } from "@uploadcn/react";
import { CameraIcon, CircleAlertIcon, RotateCcwIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { DEFAULT_LOCAL_ADAPTER } from "./utils";
import { isFocusLeaving } from "@/components/shared/focus";
import { sanitizeMediaUrl } from "@/components/shared/url";
import { Button } from "@/components/ui/button";
import { ImageCropper } from "@/components/ui/image-cropper";
import { NativeButton, Upload, UploadTrigger } from "@/components/ui/upload";
import { useCropQueue } from "@/hooks/use-crop-queue";
import { cn } from "cn";

export interface AvatarUploadProps<TResult = unknown> {
  id?: string;
  adapter?: UploadAdapter<TResult>;
  /** Current avatar URL, shown until a new one is uploaded. */
  src?: string | null;
  accept?: ValidationOptions["accept"];
  maxSize?: number;
  /** Output size in pixels (square). Default 512. */
  size?: number;
  /** Enable interactive round crop dialog before upload. Default true. */
  crop?: boolean;
  /** Enable Ctrl/⌘+V paste upload. Default true. */
  paste?: boolean | "global";
  disabled?: boolean;
  readOnly?: boolean;
  showRemove?: boolean;
  hasError?: boolean;
  describedBy?: string;
  /** Called with the upload result, or `null` when the avatar is removed. */
  onChange?: (item: UploadItem<TResult> | null) => void;
  onBlur?: () => void;
  name?: string;
  className?: string;
}

const AVATAR_RING_RADIUS = 46;
const AVATAR_RING_CIRCUMFERENCE = 2 * Math.PI * AVATAR_RING_RADIUS;
const ACTIVE_STATUSES = new Set(["uploading", "queued", "validating"]);

export function AvatarUpload<TResult = unknown>({
  id,
  adapter,
  src,
  accept = "image/*",
  maxSize = 10 * 1000 * 1000,
  size = 512,
  crop = true,
  paste = true,
  disabled = false,
  readOnly = false,
  showRemove = true,
  hasError = false,
  describedBy,
  onChange,
  onBlur,
  name,
  className,
}: AvatarUploadProps<TResult>) {
  const t = useTranslations("form");
  const isInteractive = !disabled && !readOnly;
  const crops = useCropQueue();
  const safeFallbackUrl = sanitizeMediaUrl(src ?? undefined, { allowDataImage: true }) ?? null;

  const uploader = useUploader<TResult>({
    adapter: adapter ?? (DEFAULT_LOCAL_ADAPTER as UploadAdapter<TResult>),
    accept,
    maxSize,
    maxFiles: 1,
    transform: crop ? crops.request : undefined,
    onSuccess: (item) => {
      uploader.remove((existing) => existing.id !== item.id);
      onChange?.(item);
    },
  });

  React.useEffect(() => {
    if (src) return;
    if (uploader.getState().items.some((item) => item.status === "success")) {
      uploader.remove((item) => item.status === "success");
    }
  }, [src, uploader]);

  const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (isFocusLeaving(event)) onBlur?.();
  };

  return (
    <div onBlur={handleContainerBlur} className={className}>
      <Upload
        uploader={uploader}
        multiple={false}
        disabled={!isInteractive}
        paste={isInteractive ? paste : false}
        name={name}
        className="w-auto flex-row items-center gap-4"
      >
        <AvatarPreview
          id={id}
          fallbackSrc={safeFallbackUrl}
          isInteractive={isInteractive}
          hasError={hasError}
          describedBy={describedBy}
        />

        <div className="flex flex-col gap-2">
          {isInteractive && (
            <div className="flex flex-wrap items-center gap-2">
              <UploadTrigger>
                <CameraIcon data-icon="inline-start" aria-hidden="true" />
                {safeFallbackUrl ? t("upload_avatar_change") : t("upload_dropzone_title")}
              </UploadTrigger>
              <AvatarRetry />
              {showRemove && <AvatarRemove hasFallback={Boolean(safeFallbackUrl)} onRemove={() => onChange?.(null)} />}
            </div>
          )}
          <AvatarHint />
        </div>

        {crop && isInteractive && (
          <ImageCropper
            file={crops.current}
            cropShape="round"
            aspect={1}
            output={{ maxWidth: size, maxHeight: size, type: "image/webp", quality: 0.9 }}
            onCrop={crops.complete}
            onCancel={crops.skip}
            title={t("upload_avatar_crop_title")}
            description={t("upload_avatar_crop_desc")}
          />
        )}
      </Upload>
    </div>
  );
}

function useAvatarItem() {
  const { uploader } = useUploadContext();
  return useUploadSelector(uploader, (state) => state.items.at(-1) ?? null);
}

function AvatarMedia({ item, fallbackSrc }: { item: UploadItem<unknown> | null; fallbackSrc: string | null }) {
  const t = useTranslations("form");

  if (item?.status === "error" || item?.status === "rejected") {
    return (
      <div className="text-destructive flex flex-col items-center justify-center px-2 text-center">
        <CircleAlertIcon className="size-5" aria-hidden="true" />
        <span className="mt-1 line-clamp-1 text-[10px] font-medium">{t("upload_status_failed")}</span>
      </div>
    );
  }

  if (item && item.status !== "cancelled") {
    return (
      <UploadPrimitive.Item item={item} render={<span className="contents" />}>
        <UploadPrimitive.Preview
          thumbnailSize={256}
          className="animate-in fade-in-0 size-full object-cover duration-300 motion-reduce:animate-none"
        />
      </UploadPrimitive.Item>
    );
  }

  if (fallbackSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote or blob avatar URL validated via sanitizeMediaUrl
      <img src={fallbackSrc} alt="" className="size-full object-cover" />
    );
  }

  return <UserIcon className="size-7" aria-hidden="true" />;
}

function AvatarProgressRing({ item, uploading }: { item: UploadItem<unknown>; uploading: boolean }) {
  return (
    <UploadPrimitive.Item item={item} render={<span className="contents" />}>
      <UploadPrimitive.Progress
        className={cn("pointer-events-none absolute inset-0 transition-opacity", !uploading && "opacity-0")}
        render={(props, state) => (
          <svg {...(props as React.ComponentProps<"svg">)} viewBox="0 0 100 100" aria-hidden={!uploading}>
            <circle cx="50" cy="50" r={AVATAR_RING_RADIUS} fill="none" strokeWidth="4" className="stroke-muted" />
            <circle
              cx="50"
              cy="50"
              r={AVATAR_RING_RADIUS}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={AVATAR_RING_CIRCUMFERENCE}
              strokeDashoffset={AVATAR_RING_CIRCUMFERENCE * (1 - state.percent / 100)}
              className="stroke-primary origin-center -rotate-90 transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
            />
          </svg>
        )}
      />
    </UploadPrimitive.Item>
  );
}

function AvatarPreview({
  id,
  fallbackSrc,
  isInteractive,
  hasError,
  describedBy,
}: {
  id?: string;
  fallbackSrc: string | null;
  isInteractive: boolean;
  hasError?: boolean;
  describedBy?: string;
}) {
  const t = useTranslations("form");
  const item = useAvatarItem();
  const { openFileDialog } = useUploadContext();
  const isFailed = item?.status === "error" || item?.status === "rejected";
  const uploading = Boolean(item && ACTIVE_STATUSES.has(item.status));

  return (
    <Button
      id={id}
      type="button"
      variant="ghost"
      size="icon"
      disabled={!isInteractive}
      onClick={openFileDialog}
      data-invalid={hasError || isFailed || undefined}
      aria-describedby={describedBy}
      aria-label={fallbackSrc ? t("upload_avatar_change") : t("upload_dropzone_title")}
      className={cn(
        "group/avatar relative size-24 shrink-0 rounded-full border-0 bg-transparent p-0 outline-none hover:bg-transparent focus-visible:ring-3 focus-visible:ring-ring/50",
        !isInteractive && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cn(
          "bg-muted text-muted-foreground absolute inset-1 flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed",
          hasError || isFailed ? "border-destructive bg-destructive/5" : "border-border/70",
        )}
      >
        <AvatarMedia item={item} fallbackSrc={fallbackSrc} />
        {isInteractive && (
          <span className="bg-background/70 text-foreground absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100">
            <CameraIcon className="size-5" aria-hidden="true" />
          </span>
        )}
      </span>

      {item && <AvatarProgressRing item={item} uploading={uploading} />}
    </Button>
  );
}

function AvatarRetry() {
  const t = useTranslations("form");
  const item = useAvatarItem();
  const { uploader } = useUploadContext();

  if (item?.status !== "error") return null;

  return (
    <NativeButton variant="outline" size="sm" onClick={() => uploader.retry(item.id)} className="gap-1.5">
      <RotateCcwIcon className="size-3.5" aria-hidden="true" />
      {t("upload_retry")}
    </NativeButton>
  );
}

function AvatarRemove({ hasFallback, onRemove }: { hasFallback: boolean; onRemove: () => void }) {
  const t = useTranslations("form");
  const item = useAvatarItem();
  const { uploader } = useUploadContext();

  if (!item && !hasFallback) return null;

  return (
    <NativeButton
      variant="ghost"
      size="sm"
      onClick={() => {
        uploader.remove();
        onRemove();
      }}
    >
      {t("upload_remove")}
    </NativeButton>
  );
}

function AvatarHint() {
  const t = useTranslations("form");
  const item = useAvatarItem();

  if (item?.status === "error" || item?.status === "rejected") {
    return (
      <p role="alert" className="text-destructive inline-flex items-center gap-1 text-xs">
        <CircleAlertIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{item.issues[0]?.message ?? item.error?.message ?? t("upload_status_failed")}</span>
      </p>
    );
  }

  return <p className="text-muted-foreground text-xs">{t("upload_avatar_hint")}</p>;
}
