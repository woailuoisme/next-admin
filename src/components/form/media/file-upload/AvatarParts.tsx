"use client";

import type { UploadItem } from "@uploadcn/core";
import { Upload as UploadPrimitive, useUploadContext, useUploadSelector } from "@uploadcn/react";
import { CameraIcon, CircleAlertIcon, RotateCcwIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { NativeButton } from "@/components/ui/upload";
import { cn } from "cn";

const AVATAR_RING_RADIUS = 46;
const AVATAR_RING_CIRCUMFERENCE = 2 * Math.PI * AVATAR_RING_RADIUS;
const ACTIVE_STATUSES = new Set(["uploading", "queued", "validating"]);

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

export function AvatarPreview({
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

export function AvatarRetry() {
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

export function AvatarRemove({ hasFallback, onRemove }: { hasFallback: boolean; onRemove: () => void }) {
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

export function AvatarHint() {
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
