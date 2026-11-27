"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { useActionResourceBridge } from "./context";
import type { ActionDef, ActionSurface } from "./types";
import { ACTION_COLOR_BUTTON_VARIANT, ACTION_COLOR_TEXT_CLASSES, resolveActionValue } from "./utils";

export interface ActionTriggerButtonProps<TPayload = any> {
	action: ActionDef<TPayload, any>;
	payload: TPayload;
	surface: ActionSurface;
	isPending?: boolean;
	onTrigger: (action: ActionDef<TPayload, any>, payload: TPayload) => void;
	asMenuItem?: boolean;
	iconOnly?: boolean;
	className?: string;
}

function getAccessibleLabel(label: ReactNode, ariaLabel: string | undefined, fallback: string): string {
	if (ariaLabel) return ariaLabel;
	if (typeof label === "string" && label.trim()) return label;
	return fallback;
}

function renderActionIcon(IconComponent: ActionDef<any, any>["icon"], isPending: boolean, dataIcon?: "inline-start") {
	if (isPending) {
		return <Spinner role={undefined} aria-hidden="true" data-icon={dataIcon} />;
	}
	if (IconComponent) {
		return <IconComponent aria-hidden="true" data-icon={dataIcon} />;
	}
	return null;
}

/**
 * 纯 UI 动作触发器：统一渲染 Button / IconButton / Link / DropdownMenuItem，
 * 自动处理 Tooltip、Badge、禁用态与加载态。
 */
export function ActionTriggerButton<TPayload = any>({
	action,
	payload,
	surface,
	isPending = false,
	onTrigger,
	asMenuItem = false,
	iconOnly = false,
	className,
}: ActionTriggerButtonProps<TPayload>) {
	const t = useTranslations("actions");
	const resourceBridge = useActionResourceBridge();

	const explicitLabel = resolveActionValue(action.label, payload);
	const fallbackResourceCreateLabel =
		action.id === "crud-create" && explicitLabel === undefined ? resourceBridge?.createLabel : undefined;
	const fallbackBatchDeleteLabel =
		action.id === "crud-batch-delete" && explicitLabel === undefined && Array.isArray(payload)
			? t("batch_delete", { count: payload.length })
			: undefined;
	const fallbackKeyLabel =
		explicitLabel === undefined && action.defaultLabelKey ? t(action.defaultLabelKey as never) : undefined;
	const label = explicitLabel ?? fallbackResourceCreateLabel ?? fallbackBatchDeleteLabel ?? fallbackKeyLabel;

	const ariaLabel = resolveActionValue(action.ariaLabel, payload);
	const tooltip = resolveActionValue(action.tooltip, payload);
	const badge = resolveActionValue(action.badge, payload);
	const href = resolveActionValue(action.href, payload);
	const disabled = Boolean(resolveActionValue(action.disabled, payload)) || isPending;

	const Icon = action.icon;
	const color = action.color ?? "default";
	const accessibleName = getAccessibleLabel(label, ariaLabel, t("generic_label"));

	if (asMenuItem) {
		const isDestructive = color === "destructive";
		const menuItemContent = (
			<>
				{renderActionIcon(Icon, isPending)}
				<span className="flex-1 truncate">{label ?? accessibleName}</span>
				{badge !== undefined ? (
					<Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[10px]">
						{badge}
					</Badge>
				) : null}
			</>
		);

		const menuItem = (
			<DropdownMenuItem
				variant={isDestructive ? "destructive" : "default"}
				disabled={disabled}
				onSelect={() => {
					if (!href) {
						onTrigger(action, payload);
					}
				}}
				asChild={Boolean(href && !disabled)}
				className={cn("cursor-pointer gap-2 text-xs", className)}
			>
				{href && !disabled ? (
					<Link
						href={href}
						target={action.openInNewTab ? "_blank" : undefined}
						rel={action.openInNewTab ? "noopener noreferrer" : undefined}
					>
						{menuItemContent}
					</Link>
				) : (
					menuItemContent
				)}
			</DropdownMenuItem>
		);

		return (
			<>
				{action.separator ? <DropdownMenuSeparator /> : null}
				{menuItem}
			</>
		);
	}

	const isCellIcon = iconOnly || (surface === "cell" && Boolean(Icon));
	const resolvedVariant = action.variant ?? (surface === "cell" ? "ghost" : ACTION_COLOR_BUTTON_VARIANT[color]);
	const resolvedSize = action.size ?? (isCellIcon ? "icon-sm" : "sm");

	const surfaceButtonClasses =
		surface === "batch" ? "h-7 rounded-full px-3 text-xs" : isCellIcon ? "cursor-pointer" : "h-8.5 text-xs shadow-xs";

	const colorClasses =
		surface === "cell" && color === "destructive"
			? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
			: surface === "cell"
				? cn("text-muted-foreground hover:text-foreground", ACTION_COLOR_TEXT_CLASSES[color])
				: resolvedVariant === "outline" || resolvedVariant === "ghost"
					? ACTION_COLOR_TEXT_CLASSES[color]
					: "";

	const iconNode = renderActionIcon(Icon, isPending, isCellIcon ? undefined : "inline-start");
	const buttonContent = isCellIcon ? (
		<>
			{iconNode}
			<span className="sr-only">{accessibleName}</span>
		</>
	) : (
		<>
			{iconNode}
			{label}
			{badge !== undefined ? (
				<Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
					{badge}
				</Badge>
			) : null}
		</>
	);

	const buttonNode =
		href && !disabled ? (
			<Button
				asChild
				variant={resolvedVariant}
				size={resolvedSize}
				className={cn(surfaceButtonClasses, colorClasses, className)}
			>
				<Link
					href={href}
					target={action.openInNewTab ? "_blank" : undefined}
					rel={action.openInNewTab ? "noopener noreferrer" : undefined}
					aria-label={isCellIcon ? accessibleName : ariaLabel}
				>
					{buttonContent}
				</Link>
			</Button>
		) : (
			<Button
				type="button"
				variant={resolvedVariant}
				size={resolvedSize}
				disabled={disabled}
				aria-label={isCellIcon ? accessibleName : ariaLabel}
				onClick={() => onTrigger(action, payload)}
				className={cn(surfaceButtonClasses, colorClasses, className)}
			>
				{buttonContent}
			</Button>
		);

	const resolvedTooltip = tooltip ?? (isCellIcon ? accessibleName : undefined);
	if (!resolvedTooltip) {
		return buttonNode;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{buttonNode}</TooltipTrigger>
			<TooltipContent side="top" className="text-xs">
				{resolvedTooltip}
			</TooltipContent>
		</Tooltip>
	);
}
