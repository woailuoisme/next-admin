"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { KeyValueEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { safeStringify } from "./utils";

const EMPTY_ENTRIES: Array<{ key: string; value: unknown }> = [];

function normalizeKeyValueEntries(rawValue: unknown): Array<{ key: string; value: unknown }> {
	if (!rawValue) return EMPTY_ENTRIES;
	if (Array.isArray(rawValue)) {
		const normalized: Array<{ key: string; value: unknown }> = [];
		for (const item of rawValue) {
			if (!item || typeof item !== "object") continue;
			const rec = item as { key?: unknown; value?: unknown };
			normalized.push({
				key: String(rec.key ?? ""),
				value: rec.value,
			});
		}
		return normalized;
	}
	if (typeof rawValue === "object") {
		return Object.entries(rawValue).map(([k, v]) => ({
			key: k,
			value: v,
		}));
	}
	return EMPTY_ENTRIES;
}

export function KeyValueEntry({
	name,
	value: explicitValue,
	variant = "list",
	placeholder = "-",
	...wrapperProps
}: KeyValueEntryProps) {
	const t = useTranslations("infolist");
	const rawValue = useInfolistFieldValue(name, explicitValue);
	const entries = normalizeKeyValueEntries(rawValue);

	const renderContent = () => {
		if (entries.length === 0) {
			return <EntryPlaceholder>{placeholder}</EntryPlaceholder>;
		}

		if (variant === "table") {
			return (
				<div className="border-border overflow-hidden rounded-lg border">
					<Table className="text-xs">
						<TableHeader className="bg-muted/50">
							<TableRow className="hover:bg-transparent">
								<TableHead scope="col" className="h-8 w-1/3 px-3 text-xs font-medium">
									{t("kv_key")}
								</TableHead>
								<TableHead scope="col" className="h-8 px-3 text-xs font-medium">
									{t("kv_value")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{entries.map(({ key, value }, idx) => (
								<TableRow key={`${key}-${idx}`}>
									<TableCell className="text-muted-foreground px-3 py-2 font-mono font-medium break-all whitespace-normal">
										{key}
									</TableCell>
									<TableCell className="text-foreground px-3 py-2 break-all whitespace-normal">
										{safeStringify(value)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			);
		}

		return (
			<div className="divide-border/60 border-border/80 bg-muted/20 divide-y rounded-lg border px-3 py-1 text-xs">
				{entries.map(({ key, value }, idx) => {
					const serialized = safeStringify(value);
					return (
						<div key={`${key}-${idx}`} className="flex min-w-0 items-baseline justify-between gap-4 py-1.5">
							<span className="text-muted-foreground shrink-0 font-mono font-medium">{key}</span>
							<span className="text-foreground min-w-0 flex-1 truncate text-right" title={serialized}>
								{serialized}
							</span>
						</div>
					);
				})}
			</div>
		);
	};

	return <EntryWrapper {...wrapperProps}>{renderContent()}</EntryWrapper>;
}
