import { formatBytes, type UploadItem } from "@uploadcn/core";

import type { FileUploadValue } from "./types";

export const DEFAULT_MAX_FILES = 10;
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export { formatBytes };

const IMAGE_EXTENSION_RE = /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i;

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

export const getItemResultUrl = (item: UploadItem<unknown>): string => extractUploadResultUrl(item.result);

export function formatFormValue(
	persistedUrls: string[],
	uploadedUrls: string[],
	isSingleMode: boolean,
): FileUploadValue {
	if (isSingleMode) {
		return uploadedUrls.at(-1) ?? persistedUrls[0] ?? "";
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
	if (url.startsWith("data:image/") || url.startsWith("blob:")) return true;
	const cleanUrl = url.split(/[?#]/)[0] ?? "";
	return IMAGE_EXTENSION_RE.test(cleanUrl);
}

export function getFileNameFromUrl(url: string): string {
	const clean = url.split(/[?#]/)[0] ?? url;
	return clean.split("/").pop() || clean || "file";
}
