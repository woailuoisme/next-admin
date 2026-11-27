"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { hasRenderableNode } from "@/components/shared/renderable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "cn";

import { Grid } from "./Grid";
import type { SectionProps } from "./types";

/**
 * 通用卡片/非卡片分段容器：统一替代 `FormSection` 与 `InfolistSection`。
 * 支持标题/描述/图标/操作栏/底部插槽、折叠切换与内部 `Grid` 列布局。
 */
export function Section({
	title,
	description,
	icon,
	action,
	collapsible = false,
	defaultCollapsed = false,
	columns,
	card = true,
	footer,
	className,
	children,
	...props
}: SectionProps) {
	const t = useTranslations("infolist");
	const isCollapsible = Boolean(collapsible);
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	const effectiveCollapsed = isCollapsible ? collapsed : false;

	const handleOpenChange = (open: boolean) => {
		if (!isCollapsible) return;
		setCollapsed(!open);
	};

	const showTitle = hasRenderableNode(title);
	const showDescription = hasRenderableNode(description);
	const showIcon = hasRenderableNode(icon);
	const showAction = hasRenderableNode(action);
	const showFooter = hasRenderableNode(footer);
	const hasHeader = showTitle || showDescription || showIcon || showAction;
	const showHeaderArea = hasHeader || isCollapsible;

	const contentNode = <div className="w-full">{columns ? <Grid columns={columns}>{children}</Grid> : children}</div>;

	const collapseBaseLabel = effectiveCollapsed ? t("section_expand") : t("section_collapse");
	const collapseAriaLabel =
		typeof title === "string" || typeof title === "number"
			? `${collapseBaseLabel}: ${String(title)}`
			: collapseBaseLabel;

	const collapseTrigger = isCollapsible ? (
		<CollapsibleTrigger asChild>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground hover:text-foreground rounded-md"
				aria-label={collapseAriaLabel}
				aria-expanded={!effectiveCollapsed}
			>
				<ChevronDown
					className={cn("size-4 transition-transform duration-200", effectiveCollapsed && "-rotate-90")}
					aria-hidden="true"
				/>
			</Button>
		</CollapsibleTrigger>
	) : null;

	const iconSlot = showIcon ? (
		<div
			aria-hidden="true"
			className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
		>
			{icon}
		</div>
	) : null;

	if (card) {
		const cardHeader = showHeaderArea ? (
			<CardHeader
				className={cn(
					"border-border/50 flex items-start justify-between gap-3 border-b pb-3.5",
					isCollapsible && "select-none",
				)}
			>
				{hasHeader ? (
					<div className="flex min-w-0 flex-1 items-start gap-2.5">
						{iconSlot}
						<div className="flex min-w-0 flex-1 flex-col gap-0.5">
							{showTitle && (
								<CardTitle className="text-foreground flex items-center gap-1.5 text-sm font-semibold tracking-tight">
									{title}
								</CardTitle>
							)}
							{showDescription && (
								<CardDescription className="text-muted-foreground text-xs leading-relaxed">
									{description}
								</CardDescription>
							)}
						</div>
					</div>
				) : (
					<div className="flex-1" />
				)}

				{(showAction || collapseTrigger) && (
					<CardAction className="flex shrink-0 items-center gap-2">
						{showAction ? <div className="text-xs">{action}</div> : null}
						{collapseTrigger}
					</CardAction>
				)}
			</CardHeader>
		) : null;

		const cardBody = (
			<>
				<CardContent className={cn(showHeaderArea ? "pt-4" : "p-4")}>{contentNode}</CardContent>
				{showFooter && (
					<CardFooter className="border-border/50 text-muted-foreground flex items-center justify-end gap-2 border-t pt-3 text-xs">
						{footer}
					</CardFooter>
				)}
			</>
		);

		if (!isCollapsible) {
			return (
				<Card className={cn("bg-card w-full text-left shadow-2xs transition-all duration-200", className)} {...props}>
					{cardHeader}
					{cardBody}
				</Card>
			);
		}

		return (
			<Collapsible open={!effectiveCollapsed} onOpenChange={handleOpenChange} className="w-full">
				<Card className={cn("bg-card w-full text-left shadow-2xs transition-all duration-200", className)} {...props}>
					{cardHeader}
					<CollapsibleContent>{cardBody}</CollapsibleContent>
				</Card>
			</Collapsible>
		);
	}

	const plainHeader = showHeaderArea ? (
		<div className="border-border/50 flex items-start justify-between gap-3 border-b pb-2">
			{hasHeader ? (
				<div className="flex items-start gap-2.5">
					{iconSlot}
					<div className="flex flex-col gap-0.5">
						{showTitle && (
							<h3 className="text-foreground flex items-center gap-1.5 text-sm font-semibold tracking-tight">
								{title}
							</h3>
						)}
						{showDescription && <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>}
					</div>
				</div>
			) : (
				<div className="flex-1" />
			)}
			{(showAction || collapseTrigger) && (
				<div className="flex shrink-0 items-center gap-2">
					{showAction ? action : null}
					{collapseTrigger}
				</div>
			)}
		</div>
	) : null;

	if (isCollapsible) {
		return (
			<Collapsible
				open={!effectiveCollapsed}
				onOpenChange={handleOpenChange}
				className={cn("flex w-full flex-col gap-4 text-left", className)}
				{...props}
			>
				{plainHeader}
				<CollapsibleContent>{contentNode}</CollapsibleContent>
				{showFooter && !effectiveCollapsed && (
					<div className="border-border/50 text-muted-foreground mt-4 flex items-center justify-end gap-2 border-t pt-3 text-xs">
						{footer}
					</div>
				)}
			</Collapsible>
		);
	}

	return (
		<div className={cn("flex w-full flex-col gap-4 text-left", className)} {...props}>
			{plainHeader}
			{contentNode}
			{showFooter && (
				<div className="border-border/50 text-muted-foreground mt-4 flex items-center justify-end gap-2 border-t pt-3 text-xs">
					{footer}
				</div>
			)}
		</div>
	);
}
