"use client";

import type { UploadItem as UploadItemData } from "@uploadcn/core";
import { useUploadContext } from "@uploadcn/react";
import { CheckCircle2Icon, DownloadIcon, EyeIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { sanitizeMediaUrl } from "@/components/shared/url";
import { Button, buttonVariants } from "@/components/ui/button";
import {
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
} from "@/components/ui/upload";
import { cn } from "cn";

import { getFileIcon, getFileNameFromUrl, getItemResultUrl, isImageUrl } from "./utils";

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

export function PersistedFileCard({
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

export function ActiveUploadItemRow({
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
