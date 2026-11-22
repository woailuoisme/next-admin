"use client";

import { useFormatter, useTranslations } from "next-intl";

import { CopyButton } from "@/components/shared/CopyButton";

import type { TextEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { hasRenderableNode } from "../core/utils";
import { badgeColorClasses, renderTextEntryContent } from "./textFormatting";

export { badgeColorClasses };

export function TextEntry({
	name,
	value: explicitValue,
	format = "text",
	color = "neutral",
	currency = "USD",
	decimals,
	dateOptions,
	prefix,
	suffix,
	copyable,
	placeholder = "-",
	href,
	openInNewTab = true,
	...wrapperProps
}: TextEntryProps) {
	const t = useTranslations("infolist");
	const formatter = useFormatter();
	const rawValue = useInfolistFieldValue(name, explicitValue);

	if (rawValue === null || rawValue === undefined || rawValue === "") {
		return (
			<EntryWrapper {...wrapperProps}>
				<EntryPlaceholder>{placeholder}</EntryPlaceholder>
			</EntryWrapper>
		);
	}

	const formattedContent = renderTextEntryContent({
		format,
		rawValue,
		formatter,
		color,
		currency,
		decimals,
		dateOptions,
		href,
		openInNewTab,
		booleanYesLabel: t("boolean_yes"),
		booleanNoLabel: t("boolean_no"),
		openExternalLabel: t("open_external"),
	});

	const copyText = typeof copyable === "string" ? copyable : String(rawValue);

	return (
		<EntryWrapper {...wrapperProps}>
			<div className="inline-flex max-w-full items-center gap-1.5">
				{hasRenderableNode(prefix) && <span className="text-muted-foreground shrink-0">{prefix}</span>}
				<div className="min-w-0 truncate">{formattedContent}</div>
				{hasRenderableNode(suffix) && <span className="text-muted-foreground shrink-0">{suffix}</span>}
				{copyable && <CopyButton text={copyText} className="-m-0.5 size-6 shrink-0" />}
			</div>
		</EntryWrapper>
	);
}
