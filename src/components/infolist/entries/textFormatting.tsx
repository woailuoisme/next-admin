import { ExternalLink } from "lucide-react";
import type { DateTimeFormatOptions, useFormatter } from "next-intl";
import * as React from "react";

import { sanitizeContactToken, sanitizeUrl } from "@/components/shared/url";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

import type { EntrySemanticColor, TextEntryProps } from "./types";

import { safeStringify } from "./utils";

export type InfolistFormatter = ReturnType<typeof useFormatter>;

export const badgeColorClasses: Record<EntrySemanticColor, string> = {
	primary: "border-primary/20 bg-primary/10 text-primary",
	secondary: "border-border bg-secondary text-secondary-foreground",
	success: "border-chart-2/30 bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
	warning: "border-chart-4/30 bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
	destructive: "border-destructive/25 bg-destructive/10 text-destructive",
	info: "border-chart-1/30 bg-chart-1/10 text-chart-1 dark:bg-chart-1/20",
	neutral: "border-border bg-muted/60 text-muted-foreground",
};

const ISO_CURRENCY_RE = /^[A-Za-z]{3}$/;

const DEFAULT_DATE_OPTIONS: DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
};

function parseNumericValue(raw: unknown): number | null {
	if (typeof raw === "number") {
		return Number.isFinite(raw) ? raw : null;
	}
	if (typeof raw === "string") {
		const trimmed = raw.trim();
		if (!trimmed) return null;
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

export interface FormatTextEntryContentOptions {
	format: TextEntryProps["format"];
	rawValue: unknown;
	formatter: InfolistFormatter;
	color: EntrySemanticColor;
	currency: string;
	decimals?: number;
	dateOptions?: DateTimeFormatOptions;
	href?: string;
	openInNewTab: boolean;
	booleanYesLabel: string;
	booleanNoLabel: string;
	openExternalLabel: string;
}

function renderAnchorLink(
	safeUrl: string,
	node: React.ReactNode,
	openInNewTab: boolean,
	openExternalLabel: string,
): React.ReactNode {
	return (
		<a
			href={safeUrl}
			target={openInNewTab ? "_blank" : undefined}
			rel={openInNewTab ? "noreferrer noopener" : undefined}
			className="text-primary inline-flex max-w-full min-w-0 items-center gap-1 underline-offset-4 transition-colors hover:underline"
		>
			<span className="min-w-0 truncate">{node}</span>
			{openInNewTab && (
				<>
					<ExternalLink className="size-3 shrink-0 opacity-70" aria-hidden="true" />
					<span className="sr-only"> ({openExternalLabel})</span>
				</>
			)}
		</a>
	);
}

export function renderTextEntryContent({
	format,
	rawValue,
	formatter,
	color,
	currency,
	decimals,
	dateOptions,
	href,
	openInNewTab,
	booleanYesLabel,
	booleanNoLabel,
	openExternalLabel,
}: FormatTextEntryContentOptions): React.ReactNode {
	const wrapHrefIfNeeded = (node: React.ReactNode): React.ReactNode => {
		if (!href) return node;
		const safeUrl = sanitizeUrl(href, {
			allowMailtoTel: true,
			allowRelative: true,
			allowBareDomain: false,
		});
		return safeUrl ? renderAnchorLink(safeUrl, node, openInNewTab, openExternalLabel) : node;
	};

	switch (format) {
		case "badge": {
			const displayNode =
				typeof rawValue === "boolean"
					? rawValue
						? booleanYesLabel
						: booleanNoLabel
					: typeof rawValue === "object" && !React.isValidElement(rawValue)
						? safeStringify(rawValue)
						: (rawValue as React.ReactNode);
			return wrapHrefIfNeeded(
				<Badge
					variant="outline"
					className={cn(
						"text-xs font-medium tracking-tight transition-colors",
						badgeColorClasses[color] ?? badgeColorClasses.neutral,
					)}
				>
					{displayNode}
				</Badge>,
			);
		}

		case "currency": {
			const num = parseNumericValue(rawValue);
			if (num === null) return wrapHrefIfNeeded(String(rawValue));
			const code = currency || "USD";
			if (!ISO_CURRENCY_RE.test(code)) {
				return wrapHrefIfNeeded(`${code} ${num}`);
			}
			try {
				return wrapHrefIfNeeded(
					formatter.number(num, {
						style: "currency",
						currency: code.toUpperCase(),
						minimumFractionDigits: decimals,
						maximumFractionDigits: decimals,
					}),
				);
			} catch {
				return wrapHrefIfNeeded(`${code} ${num}`);
			}
		}

		case "number": {
			const num = parseNumericValue(rawValue);
			if (num === null) return wrapHrefIfNeeded(String(rawValue));
			return wrapHrefIfNeeded(
				formatter.number(num, {
					minimumFractionDigits: decimals,
					maximumFractionDigits: decimals,
				}),
			);
		}

		case "date": {
			const date = rawValue instanceof Date ? rawValue : new Date(rawValue as string | number);
			if (Number.isNaN(date.getTime())) return wrapHrefIfNeeded(String(rawValue));
			return wrapHrefIfNeeded(formatter.dateTime(date, dateOptions ?? DEFAULT_DATE_OPTIONS));
		}

		case "url": {
			const safeUrl = sanitizeUrl(href ?? String(rawValue), {
				allowMailtoTel: false,
				allowRelative: true,
				allowBareDomain: false,
			});
			if (!safeUrl) {
				return <span>{String(rawValue)}</span>;
			}
			return renderAnchorLink(safeUrl, String(rawValue), openInNewTab, openExternalLabel);
		}

		case "email": {
			const email = sanitizeContactToken(rawValue);
			if (!email) return <span>{String(rawValue)}</span>;
			return (
				<a href={`mailto:${email}`} className="text-primary underline-offset-4 transition-colors hover:underline">
					{String(rawValue)}
				</a>
			);
		}

		case "phone": {
			const phone = sanitizeContactToken(rawValue);
			if (!phone) return <span>{String(rawValue)}</span>;
			return (
				<a href={`tel:${phone}`} className="text-primary underline-offset-4 transition-colors hover:underline">
					{String(rawValue)}
				</a>
			);
		}

		default: {
			const baseNode =
				typeof rawValue === "boolean"
					? rawValue
						? booleanYesLabel
						: booleanNoLabel
					: typeof rawValue === "object" && !React.isValidElement(rawValue)
						? safeStringify(rawValue)
						: (rawValue as React.ReactNode);
			return wrapHrefIfNeeded(baseNode);
		}
	}
}
