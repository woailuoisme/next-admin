"use client";

import { httpAdapter } from "@uploadcn/core";
import { shallowArrayEqual, useUploadValue, useUploader } from "@uploadcn/react";
import { cn } from "cn";
import { DownloadIcon, FileIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { AvatarUpload } from "@/components/avatar-upload";
import { FileUpload } from "@/components/file-upload";
import { createContainerBlurHandler } from "@/components/form/core";
import { sanitizeMediaUrl } from "@/components/shared/url";
import { Button, buttonVariants } from "@/components/ui/button";

import type { FileUploadCoreProps } from "./types";
import {
	DEFAULT_MAX_FILES,
	DEFAULT_MAX_SIZE,
	formatBytes,
	formatFormValue,
	getFileNameFromUrl,
	getItemResultUrl,
	isImageUrl,
	normalizeUrls,
} from "./utils";

function GridFileUpload({
	id,
	value,
	onChange,
	onBlur,
	accept,
	multiple = false,
	maxFiles = DEFAULT_MAX_FILES,
	maxSize = DEFAULT_MAX_SIZE,
	adapter,
	endpoint,
	headers,
	paste = true,
	showDownload = false,
	showRemove = true,
	disabled = false,
	readOnly = false,
	hasError = false,
	describedBy,
	dropzoneClassName,
	className,
}: FileUploadCoreProps) {
	const t = useTranslations("form");
	const isInteractive = !disabled && !readOnly;
	const isSingleMode = !multiple;
	const resolvedAdapter = adapter ?? (endpoint ? httpAdapter({ url: endpoint, headers }) : undefined);

	const [sessionUrls, setSessionUrls] = useState<string[]>([]);
	const [sessionMimeByUrl, setSessionMimeByUrl] = useState<Record<string, string>>({});
	const createdBlobUrlsRef = useRef<Set<string>>(new Set());

	const rawUrls = normalizeUrls(value);
	const persistedUrlsPreview = isSingleMode ? rawUrls : rawUrls.filter((url) => !sessionUrls.includes(url));
	const remainingMaxFiles = isSingleMode ? 1 : Math.max(0, maxFiles - persistedUrlsPreview.length);

	const uploader = useUploader({
		adapter: resolvedAdapter,
		accept,
		maxFiles: remainingMaxFiles,
		maxSize,
	});
	const uploadedUrls = useUploadValue(uploader, getItemResultUrl);
	const prevUploadedRef = useRef<string[]>(uploadedUrls);

	const revokeBlobIfOwned = (url: string) => {
		if (url.startsWith("blob:") && createdBlobUrlsRef.current.has(url)) {
			URL.revokeObjectURL(url);
			createdBlobUrlsRef.current.delete(url);
		}
	};

	useEffect(() => {
		const unsubSuccess = uploader.on("success", ({ item }) => {
			const url = getItemResultUrl(item);
			if (!url) return;
			if (url.startsWith("blob:") && !adapter && !endpoint) {
				createdBlobUrlsRef.current.add(url);
			}
			const fileType = item.file?.type;
			if (fileType) {
				setSessionMimeByUrl((prev) => (prev[url] === fileType ? prev : { ...prev, [url]: fileType }));
			}
			setSessionUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
		});

		const unsubRemove = uploader.on("remove", ({ item }) => {
			const url = getItemResultUrl(item);
			if (!url) return;
			revokeBlobIfOwned(url);
			setSessionMimeByUrl((prev) => {
				if (!(url in prev)) return prev;
				const next = { ...prev };
				delete next[url];
				return next;
			});
		});

		return () => {
			unsubSuccess();
			unsubRemove();
		};
	}, [adapter, endpoint, uploader]);

	useEffect(() => {
		const owned = createdBlobUrlsRef.current;
		return () => {
			for (const url of owned) {
				URL.revokeObjectURL(url);
			}
			owned.clear();
		};
	}, []);

	const persistedUrls =
		isSingleMode && uploadedUrls.length > 0 ? [] : rawUrls.filter((url) => !sessionUrls.includes(url));

	useEffect(() => {
		if (shallowArrayEqual(prevUploadedRef.current, uploadedUrls)) return;
		prevUploadedRef.current = uploadedUrls;
		const basePersisted = isSingleMode ? [] : normalizeUrls(value).filter((url) => !sessionUrls.includes(url));
		onChange(formatFormValue(basePersisted, uploadedUrls, isSingleMode));
	}, [isSingleMode, onChange, sessionUrls, uploadedUrls, value]);

	const descParts = [
		accept ? t("upload_supported_formats", { accept }) : t("upload_all_formats"),
		maxSize ? t("upload_max_size", { size: formatBytes(maxSize) }) : null,
	].filter(Boolean);

	return (
		<div
			id={id}
			aria-describedby={describedBy}
			aria-invalid={hasError || undefined}
			aria-disabled={!isInteractive || undefined}
			inert={!isInteractive || undefined}
			onBlur={createContainerBlurHandler(onBlur)}
			className={cn("flex flex-col gap-3", !isInteractive && "pointer-events-none opacity-60", className)}
		>
			<FileUpload
				uploader={uploader}
				accept={accept}
				maxFiles={remainingMaxFiles}
				maxSize={maxSize}
				disabled={!isInteractive}
				paste={isInteractive ? paste : false}
				title={t("upload_dropzone_title")}
				description={descParts.join(" · ")}
				className={dropzoneClassName}
			/>

			{persistedUrls.length > 0 ? (
				<div className="flex flex-col gap-2">
					{persistedUrls.map((rawUrl) => {
						const safeUrl = sanitizeMediaUrl(rawUrl, { allowDataImage: true });
						const fileName = getFileNameFromUrl(rawUrl);
						const showThumb = Boolean(safeUrl) && isImageUrl(rawUrl, sessionMimeByUrl[rawUrl]);

						return (
							<div
								key={rawUrl}
								className="bg-card border-border/70 flex items-center gap-3 rounded-lg border p-2.5 shadow-2xs"
							>
								<div className="bg-muted/50 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
									{showThumb && safeUrl ? (
										<img src={safeUrl} alt={fileName} className="size-full object-cover" />
									) : (
										<FileIcon className="text-muted-foreground size-4" aria-hidden="true" />
									)}
								</div>

								<span className="text-foreground min-w-0 flex-1 truncate text-xs font-medium" title={fileName}>
									{fileName}
								</span>

								<div className="flex items-center gap-1">
									{showDownload && safeUrl ? (
										<a
											href={safeUrl}
											download={fileName}
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
									) : null}

									{showRemove && isInteractive ? (
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={() => {
												revokeBlobIfOwned(rawUrl);
												const nextPersisted = persistedUrls.filter((item) => item !== rawUrl);
												onChange(formatFormValue(nextPersisted, uploadedUrls, isSingleMode));
											}}
											title={t("upload_remove")}
											aria-label={t("upload_remove")}
											className="text-muted-foreground hover:text-destructive"
										>
											<Trash2Icon className="size-3.5" aria-hidden="true" />
										</Button>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			) : null}
		</div>
	);
}

/**
 * 表单文件上传适配器：直接组合 shadcn CLI 生成的 `@uploadcn/file-upload` 与 `@uploadcn/avatar-upload`，
 * 并桥接表单 URL 值（单文件 `string` / 多文件 `string[]`）与全局 `<UploadConfig>`。
 */
export function FileUploadCore(props: FileUploadCoreProps) {
	if (props.mode === "avatar") {
		const isInteractive = !props.disabled && !props.readOnly;
		const resolvedAdapter =
			props.adapter ?? (props.endpoint ? httpAdapter({ url: props.endpoint, headers: props.headers }) : undefined);
		const rawAvatar = normalizeUrls(props.value)[0];
		const safeAvatarSrc = rawAvatar ? sanitizeMediaUrl(rawAvatar, { allowDataImage: true }) : null;

		return (
			<div
				id={props.id}
				aria-describedby={props.describedBy}
				aria-invalid={props.hasError || undefined}
				aria-disabled={!isInteractive || undefined}
				inert={!isInteractive || undefined}
				onBlur={createContainerBlurHandler(props.onBlur)}
				className={cn(!isInteractive && "pointer-events-none opacity-60", props.className)}
			>
				<AvatarUpload
					adapter={resolvedAdapter}
					src={safeAvatarSrc}
					name={props.id}
					onChange={(item) => props.onChange(item ? getItemResultUrl(item) : "")}
				/>
			</div>
		);
	}

	return <GridFileUpload {...props} />;
}
