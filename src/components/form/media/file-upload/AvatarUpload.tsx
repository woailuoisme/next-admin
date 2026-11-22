"use client";

import { type UploadAdapter, type UploadItem, type ValidationOptions } from "@uploadcn/core";
import { useUploader } from "@uploadcn/react";
import { CameraIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { isFocusLeaving } from "@/components/shared/focus";
import { sanitizeMediaUrl } from "@/components/shared/url";
import { ImageCropper } from "@/components/ui/image-cropper";
import { Upload, UploadTrigger } from "@/components/ui/upload";
import { useCropQueue } from "@/hooks/use-crop-queue";

import { AvatarHint, AvatarPreview, AvatarRemove, AvatarRetry } from "./AvatarParts";
import { DEFAULT_LOCAL_ADAPTER } from "./utils";

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
