"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "cn";

import type { CodeEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { safeStringify } from "./utils";

export function CodeEntry({
	name,
	value: explicitValue,
	language,
	formatJson = true,
	copyable = true,
	maxHeight = "max-h-64",
	placeholder = "-",
	...wrapperProps
}: CodeEntryProps) {
	const t = useTranslations("infolist");
	const rawValue = useInfolistFieldValue(name, explicitValue);

	if (rawValue === null || rawValue === undefined || rawValue === "") {
		return (
			<EntryWrapper {...wrapperProps}>
				<EntryPlaceholder>{placeholder}</EntryPlaceholder>
			</EntryWrapper>
		);
	}

	const displayCode = safeStringify(rawValue, formatJson);
	const resolvedLanguage = language ?? (typeof rawValue === "object" ? "json" : "code");

	return (
		<EntryWrapper {...wrapperProps}>
			<div className="group border-border bg-muted/40 relative overflow-hidden rounded-lg border text-xs">
				<div className="border-border/60 bg-muted/60 text-muted-foreground flex items-center justify-between border-b px-3 py-1.5 text-[11px] select-none">
					<span>{resolvedLanguage}</span>
					{copyable && <CopyButton text={displayCode} className="-m-0.5 size-6" />}
				</div>
				<pre
					tabIndex={0}
					aria-label={language ? `${language} ${t("code_block")}` : t("code_block")}
					className={cn(
						"focus-visible:ring-ring overflow-auto p-3 font-mono text-xs leading-relaxed text-foreground/90 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
						maxHeight,
					)}
				>
					<code>{displayCode}</code>
				</pre>
			</div>
		</EntryWrapper>
	);
}
