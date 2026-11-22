"use client";

import * as React from "react";

import type { EntryOrientation, InfolistConfigValue, InfolistContextValue } from "./types";

const DEFAULT_CONFIG: InfolistConfigValue = {
	orientation: "vertical",
	dense: false,
};

export const InfolistConfigContext = React.createContext<InfolistConfigValue>(DEFAULT_CONFIG);
const InfolistRecordContext = React.createContext<unknown>(undefined);

const BLOCKED_PATH_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** 缓存解析后的安全属性路径数组（`null` 表示包含被拦截的危险段），避免重复正则切割 */
const PATH_CACHE = new Map<string, string[] | null>();

function parseNestedPath(path: string): string[] | null {
	const cached = PATH_CACHE.get(path);
	if (cached !== undefined) {
		return cached;
	}

	const normalized = path.replace(/\[([^\]]+)\]/g, ".$1").replace(/^\.+|\.+$/g, "");
	const parts = normalized ? normalized.split(".").filter(Boolean) : [];
	const resolved = parts.some((part) => BLOCKED_PATH_KEYS.has(part)) ? null : parts;

	if (PATH_CACHE.size < 500) {
		PATH_CACHE.set(path, resolved);
	}
	return resolved;
}

export function getNestedValue(obj: unknown, path: string): unknown {
	if (!obj || typeof obj !== "object" || !path) return undefined;

	const parts = parseNestedPath(path);
	if (!parts || parts.length === 0) return undefined;

	let current: unknown = obj;
	for (const part of parts) {
		if (current === null || typeof current !== "object") {
			return undefined;
		}

		if (Array.isArray(current)) {
			if (!/^\d+$/.test(part)) {
				return undefined;
			}
			const index = Number(part);
			if (!Number.isInteger(index) || index < 0 || index >= current.length) {
				return undefined;
			}
			current = current[index];
			continue;
		}

		if (!Object.hasOwn(current, part)) {
			return undefined;
		}
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}

export function InfolistProvider({
	record,
	orientation = "vertical",
	dense = false,
	children,
}: {
	record?: unknown;
	orientation?: EntryOrientation;
	dense?: boolean;
	children: React.ReactNode;
}) {
	const configValue: InfolistConfigValue = { orientation, dense };

	return (
		<InfolistConfigContext value={configValue}>
			<InfolistRecordContext value={record}>{children}</InfolistRecordContext>
		</InfolistConfigContext>
	);
}

/**
 * 仅订阅布局与密度配置，隔离 record 数据变动导致的无效重渲染
 */
export function useInfolistConfig(): InfolistConfigValue {
	return React.useContext(InfolistConfigContext);
}

export function useInfolistContext<TRecord = unknown>(): InfolistContextValue<TRecord> {
	const config = React.useContext(InfolistConfigContext);
	const record = React.useContext(InfolistRecordContext) as TRecord | undefined;

	return {
		record,
		orientation: config.orientation,
		dense: config.dense,
	};
}

export function useInfolistFieldValue<T = unknown>(name?: string, explicitValue?: T): T | undefined {
	if (explicitValue !== undefined) {
		return explicitValue;
	}

	if (!name) {
		return undefined;
	}

	const record = React.use(InfolistRecordContext);
	if (record !== null && typeof record === "object") {
		return getNestedValue(record, name) as T | undefined;
	}

	return undefined;
}
