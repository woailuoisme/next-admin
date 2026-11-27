"use client";

import { renderIconSlot } from "@/components/shared/renderable";
import { sanitizeUrl } from "@/components/shared/url";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { CalloutAction } from "./types";

interface CalloutActionButtonProps {
	action: CalloutAction;
	defaultVariant: "default" | "outline";
	defaultSize: "default" | "sm" | "xs";
	defaultClass?: string;
	className?: string;
	openExternalLabel: string;
}

/**
 * InfolistCallout 动作按钮：安全消毒外部链接并在无障碍层标注新窗口打开提示。
 */
export function CalloutActionButton({
	action,
	defaultVariant,
	defaultSize,
	defaultClass,
	className,
	openExternalLabel,
}: CalloutActionButtonProps) {
	const variant = action.variant ?? defaultVariant;
	const size = action.size ?? defaultSize;
	const isDefaultVariant = variant === "default";

	const safeHref = action.href
		? sanitizeUrl(action.href, {
				allowMailtoTel: true,
				allowRelative: true,
				allowBareDomain: false,
			})
		: null;
	const isBlockedLink = Boolean(action.href) && !safeHref && !action.onClick;

	const iconNode = renderIconSlot(action.icon);
	const renderedIcon = iconNode ? (
		<span data-icon="inline-start" className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
			{iconNode}
		</span>
	) : null;

	const content = (
		<>
			{renderedIcon}
			{action.label}
			{safeHref && action.external ? <span className="sr-only"> ({openExternalLabel})</span> : null}
		</>
	);

	return (
		<Button
			type={safeHref ? undefined : "button"}
			size={size}
			variant={variant}
			disabled={isBlockedLink}
			className={cn(className, isDefaultVariant && defaultClass)}
			asChild={Boolean(safeHref)}
			onClick={action.onClick}
		>
			{safeHref ? (
				<a
					href={safeHref}
					target={action.external ? "_blank" : undefined}
					rel={action.external ? "noreferrer noopener" : undefined}
				>
					{content}
				</a>
			) : (
				content
			)}
		</Button>
	);
}
