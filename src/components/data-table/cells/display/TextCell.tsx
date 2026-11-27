import { isNil } from "es-toolkit";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

import { CopyButton } from "@/components/shared/CopyButton";
import { handleActivationKey } from "@/components/shared/activationKey";
import { sanitizeUrl } from "@/components/shared/url";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { TextCellProps } from "./types";

import { STACK_ALIGN_CLASSES } from "../base";

const sizeClasses = {
	xs: "text-[11px]",
	sm: "text-xs",
	base: "text-sm",
};

const weightClasses = {
	normal: "font-normal",
	medium: "font-medium",
	semibold: "font-semibold",
	bold: "font-bold",
};

const clampClasses = {
	1: "line-clamp-1",
	2: "line-clamp-2",
	3: "line-clamp-3",
};

const tagVariantMap = {
	outline: "outline",
	secondary: "secondary",
	primary: "default",
	muted: "secondary",
} as const;

const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

interface HighlightMatcher {
	regex: RegExp;
	lowerQuery: string;
}

function buildHighlightMatcher(query?: string): HighlightMatcher | null {
	const trimmed = query?.trim();
	if (!trimmed) return null;
	const escaped = trimmed.replace(REGEXP_SPECIAL_CHARS, "\\$&");
	return {
		regex: new RegExp(`(${escaped})`, "gi"),
		lowerQuery: trimmed.toLowerCase(),
	};
}

/** 安全高亮匹配字符串 */
function highlightString(text: string, matcher: HighlightMatcher | null): React.ReactNode {
	if (!matcher) return text;
	const parts = text.split(matcher.regex);

	if (parts.length <= 1) return text;

	return (
		<>
			{parts.map((part, i) =>
				part.toLowerCase() === matcher.lowerQuery ? (
					<mark key={i} className="bg-primary/20 text-primary rounded-xs px-0.5 font-medium">
						{part}
					</mark>
				) : (
					part
				),
			)}
		</>
	);
}

function sanitizeSafeHref(href?: string): string | undefined {
	if (!href) return undefined;
	const trimmed = href.trim();
	if (!trimmed) return undefined;
	if (trimmed.startsWith("?")) return trimmed;
	return sanitizeUrl(trimmed, { allowMailtoTel: true, allowRelative: true, allowBareDomain: false }) ?? undefined;
}

export function TextCell({
	title,
	value,
	description,
	prefix,
	suffix,
	highlightText,
	tag,
	tagVariant = "secondary",
	kbd,
	url,
	isExternal = false,
	lineClamp,
	copyable,
	mono = false,
	truncate = true,
	tooltip,
	size = "sm",
	weight = "normal",
	align = "left",
	onClick,
	className,
}: TextCellProps) {
	const t = useTranslations("table");
	const highlightMatcher = buildHighlightMatcher(highlightText);

	const resolvedTitle = title !== undefined ? title : value;
	if (isNil(resolvedTitle)) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const copyText =
		typeof copyable === "string"
			? copyable
			: typeof resolvedTitle === "string" || typeof resolvedTitle === "number"
				? String(resolvedTitle)
				: "";

	const renderedTitle =
		typeof resolvedTitle === "string" && highlightMatcher
			? highlightString(resolvedTitle, highlightMatcher)
			: resolvedTitle;

	const titleElement = (
		<span
			className={cn(
				"leading-tight tracking-tight text-foreground",
				sizeClasses[size],
				weightClasses[weight],
				mono && "font-mono",
				lineClamp ? clampClasses[lineClamp] : truncate && "truncate",
			)}
		>
			{renderedTitle}
		</span>
	);

	const safeUrl = sanitizeSafeHref(url);

	const linkedTitle = safeUrl ? (
		<a
			href={safeUrl}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			className="hover:text-primary inline-flex items-center gap-1 transition-colors hover:underline"
			onClick={(e) => {
				if (onClick) {
					e.stopPropagation();
				}
			}}
		>
			{titleElement}
			{isExternal ? <ExternalLink aria-hidden="true" className="size-3 shrink-0 opacity-70" /> : null}
		</a>
	) : onClick ? (
		<span
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => handleActivationKey(e, onClick)}
			className="focus-visible:ring-ring cursor-pointer rounded-xs hover:underline focus-visible:ring-1 focus-visible:outline-hidden"
		>
			{titleElement}
		</span>
	) : (
		titleElement
	);

	const renderedDescription =
		typeof description === "string" && highlightMatcher ? highlightString(description, highlightMatcher) : description;

	const content = (
		<div className={cn("group/text-cell flex max-w-full min-w-0 flex-col", STACK_ALIGN_CLASSES[align], className)}>
			<div className="flex max-w-full min-w-0 items-center gap-1.5">
				{!isNil(prefix) && prefix !== "" ? <span className="text-muted-foreground shrink-0">{prefix}</span> : null}

				{linkedTitle}

				{!isNil(tag) && tag !== "" ? (
					<Badge
						variant={tagVariantMap[tagVariant]}
						className={cn(
							"h-4 px-1.5 py-0 text-[10px] leading-none font-medium tracking-tight",
							tagVariant === "primary" && "border-primary/20 bg-primary/10 text-primary",
							tagVariant === "muted" && "border-border/50 bg-muted/60 text-muted-foreground",
						)}
					>
						{tag}
					</Badge>
				) : null}

				{kbd ? (
					<kbd className="border-border bg-muted/80 text-muted-foreground inline-flex shrink-0 items-center rounded border px-1 py-0.5 font-mono text-[9px] font-semibold shadow-2xs">
						{kbd}
					</kbd>
				) : null}

				{!isNil(suffix) && suffix !== "" ? <span className="text-muted-foreground shrink-0">{suffix}</span> : null}

				{copyable && copyText ? (
					<CopyButton
						text={copyText}
						className="ml-0.5 shrink-0 opacity-0 transition-opacity group-hover/text-cell:opacity-100"
						title={t("cell_copy_title")}
					/>
				) : null}
			</div>

			{!isNil(description) && description !== "" ? (
				<span
					className={cn(
						"mt-0.5 text-[11px] leading-normal text-muted-foreground/80",
						mono && "font-mono",
						lineClamp ? clampClasses[lineClamp] : truncate && "max-w-full truncate",
					)}
				>
					{renderedDescription}
				</span>
			) : null}
		</div>
	);

	if (tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="w-full">{content}</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="text-xs">
					{tooltip}
				</TooltipContent>
			</Tooltip>
		);
	}

	return content;
}
