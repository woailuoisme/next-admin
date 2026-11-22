"use client";

import { httpAdapter } from "@uploadcn/core";

import { cn } from "cn";

import { AvatarUpload } from "./AvatarUpload";
import { GridUploadCore } from "./GridUploadCore";
import type { FileUploadCoreProps } from "./types";
import {
	DEFAULT_LOCAL_ADAPTER,
	DEFAULT_MAX_FILES,
	DEFAULT_MAX_SIZE,
	getItemResultUrl,
	normalizeUrls,
	parseAllowedFileTypes,
} from "./utils";

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
	dropzoneClassName,
}: FileUploadCoreProps) {
	const resolvedClassName = dropzoneClassName ?? className;
	const isSingleMode = mode === "avatar" || !multiple || maxFiles === 1;
	const effectiveMaxFiles = isSingleMode ? 1 : maxFiles;
	const resolvedAccept = mode === "avatar" && !accept ? "image/*" : accept;
	const parsedAccept = parseAllowedFileTypes(resolvedAccept) ?? undefined;
	const resolvedAdapter = adapter ?? (endpoint ? httpAdapter({ url: endpoint, headers }) : DEFAULT_LOCAL_ADAPTER);
	const normalizedUrls = normalizeUrls(value);

	if (mode === "avatar") {
		return (
			<div className={cn("w-full", resolvedClassName)}>
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
			className={resolvedClassName}
		/>
	);
}
