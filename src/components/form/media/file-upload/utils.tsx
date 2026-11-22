"use client";

import { localAdapter, type UploadItem } from "@uploadcn/core";
import { File, FileArchive, FileCode, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";

import type { FileUploadValue } from "./types";

export const DEFAULT_MAX_FILES = 10;
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
export const DEFAULT_LOCAL_ADAPTER = localAdapter();

export const getItemResultUrl = (item: UploadItem<unknown>): string => extractUploadResultUrl(item.result);

export function collectSucceededUrls(items: readonly UploadItem<unknown>[]): string[] {
	return items
		.filter((item) => item.status === "success")
		.map(getItemResultUrl)
		.filter(Boolean);
}

const IMAGE_EXTENSION_RE = /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i;

const FILE_ICON_CLASSES = {
	image: "size-5 text-chart-1",
	pdf: "size-5 text-destructive",
	spreadsheet: "size-5 text-chart-2",
	archive: "size-5 text-chart-4",
	code: "size-5 text-primary",
	fallback: "size-5 text-muted-foreground",
} as const;

export function normalizeUrls(value: unknown): string[] {
	if (typeof value === "string") return value ? [value] : [];
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string" && item.length > 0);
	}
	return [];
}

export function extractUploadResultUrl(result: unknown): string {
	if (typeof result === "string") return result;
	if (result && typeof result === "object") {
		const record = result as Record<string, unknown>;
		if (typeof record.url === "string") return record.url;
		if (typeof record.uploadURL === "string") return record.uploadURL;
		if (typeof record.key === "string") return record.key;
		if (record.data && typeof record.data === "object") {
			return extractUploadResultUrl(record.data);
		}
	}
	return "";
}

export function formatFormValue(
	persistedUrls: string[],
	uploadedUrls: string[],
	isSingleMode: boolean,
): FileUploadValue {
	if (isSingleMode) {
		const latest = uploadedUrls.at(-1) ?? persistedUrls[0] ?? "";
		return latest;
	}
	const merged: string[] = [];
	const seen = new Set<string>();
	for (const url of [...persistedUrls, ...uploadedUrls]) {
		if (url && !seen.has(url)) {
			seen.add(url);
			merged.push(url);
		}
	}
	return merged;
}

export function parseAllowedFileTypes(accept?: string): string[] | null {
	if (!accept || !accept.trim()) return null;
	const tokens = accept
		.split(",")
		.map((token) => token.trim())
		.filter((token) => Boolean(token) && token !== "*/*");
	return tokens.length > 0 ? tokens : null;
}

export function isImageUrl(url: string): boolean {
	if (url.startsWith("data:image/")) return true;
	if (url.startsWith("blob:")) return true;
	const cleanUrl = url.split(/[?#]/)[0] ?? "";
	return IMAGE_EXTENSION_RE.test(cleanUrl);
}

export function getFileNameFromUrl(url: string): string {
	const clean = url.split(/[?#]/)[0] ?? url;
	return clean.split("/").pop() || clean || "file";
}

export function formatBytes(bytes?: number | null): string {
	if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
	return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

export function getFileIcon(type?: string, name?: string) {
	const filename = (name || "").toLowerCase();
	const mime = (type || "").toLowerCase();

	if (mime.startsWith("image/") || IMAGE_EXTENSION_RE.test(filename)) {
		return <ImageIcon className={FILE_ICON_CLASSES.image} aria-hidden="true" />;
	}
	if (mime.includes("pdf") || filename.endsWith(".pdf")) {
		return <FileText className={FILE_ICON_CLASSES.pdf} aria-hidden="true" />;
	}
	if (mime.includes("sheet") || mime.includes("excel") || /\.(xlsx|xls|csv)$/.test(filename)) {
		return <FileSpreadsheet className={FILE_ICON_CLASSES.spreadsheet} aria-hidden="true" />;
	}
	if (mime.includes("zip") || mime.includes("archive") || /\.(zip|tar|gz|rar|7z)$/.test(filename)) {
		return <FileArchive className={FILE_ICON_CLASSES.archive} aria-hidden="true" />;
	}
	if (
		mime.includes("json") ||
		mime.includes("javascript") ||
		mime.includes("typescript") ||
		/\.(js|ts|tsx|json|html|css)$/.test(filename)
	) {
		return <FileCode className={FILE_ICON_CLASSES.code} aria-hidden="true" />;
	}
	return <File className={FILE_ICON_CLASSES.fallback} aria-hidden="true" />;
}
