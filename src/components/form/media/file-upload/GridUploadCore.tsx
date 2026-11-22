"use client";

import type { UploadAdapter } from "@uploadcn/core";
import { defaultMessages } from "@uploadcn/react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { isFocusLeaving } from "@/components/shared/focus";
import { sanitizeMediaUrl } from "@/components/shared/url";
import {
	Upload,
	UploadDropzone,
	UploadDropzoneDescription,
	UploadDropzoneHeader,
	UploadDropzoneMedia,
	UploadDropzonePasteHint,
	UploadDropzoneTitle,
	UploadList,
} from "@/components/ui/upload";
import { cn } from "cn";

import type { FileUploadValue } from "./types";
import { ActiveUploadItemRow, PersistedFileCard } from "./UploadFileCards";
import { useFileUploadQueue } from "./useFileUploadQueue";
import { formatBytes } from "./utils";

const DynamicImageLightboxModal = dynamic(
	() => import("@/components/shared/ImageLightboxModal").then((mod) => mod.ImageLightboxModal),
	{ ssr: false },
);

export interface GridUploadCoreProps {
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

export function GridUploadCore({
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

	const { uploader, persistedUrls, canUploadMore, previewImages, handleRemovePersisted } = useFileUploadQueue({
		normalizedUrls,
		resolvedAdapter,
		parsedAccept,
		maxSize,
		effectiveMaxFiles,
		isSingleMode,
		onChange,
	});

	const handleOpenPreview = (rawUrl: string) => {
		const safeUrl = sanitizeMediaUrl(rawUrl, { allowDataImage: true });
		if (safeUrl) setPreviewModalUrl(safeUrl);
	};

	const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
		if (isFocusLeaving(event)) onBlur?.();
	};

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
