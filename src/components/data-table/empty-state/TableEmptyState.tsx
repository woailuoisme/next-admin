import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";
import { type ComponentType, isValidElement, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "cn";

import type {
	TableEmptyStateAction,
	TableEmptyStateIconColor,
	TableEmptyStateProps,
	TableEmptyStateSize,
} from "./types";

const ICON_COLOR_CLASSES: Record<TableEmptyStateIconColor, string> = {
	muted: "bg-muted/70 text-muted-foreground/80 border-border/50",
	primary: "bg-primary/10 text-primary border-primary/20",
	warning: "bg-chart-4/10 text-chart-4 border-chart-4/20",
	destructive: "bg-destructive/10 text-destructive border-destructive/20",
	success: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const SIZE_CONFIGS: Record<
	TableEmptyStateSize,
	{
		containerClass: string;
		badgeClass: string;
		iconSizeClass: string;
		headingClass: string;
		descriptionClass: string;
		actionButtonSize: "xs" | "sm" | "default";
	}
> = {
	sm: {
		containerClass: "p-4 gap-2",
		badgeClass: "size-10",
		iconSizeClass: "size-5 stroke-[1.5]",
		headingClass: "text-xs font-semibold text-foreground",
		descriptionClass: "text-[11px] text-muted-foreground max-w-xs",
		actionButtonSize: "xs",
	},
	md: {
		containerClass: "p-6 gap-3",
		badgeClass: "size-12",
		iconSizeClass: "size-6 stroke-[1.5]",
		headingClass: "text-sm font-semibold text-foreground",
		descriptionClass: "text-xs text-muted-foreground max-w-sm",
		actionButtonSize: "sm",
	},
	lg: {
		containerClass: "p-8 gap-4",
		badgeClass: "size-14",
		iconSizeClass: "size-7 stroke-[1.5]",
		headingClass: "text-base font-semibold text-foreground",
		descriptionClass: "text-sm text-muted-foreground max-w-md",
		actionButtonSize: "default",
	},
};

export function TableEmptyState({
	heading,
	description,
	icon: IconProp = Inbox,
	iconColor = "muted",
	size = "md",
	actions,
	renderActions: customRenderActions,
	footer,
	className,
}: TableEmptyStateProps) {
	const t = useTranslations("table");
	const finalHeading = heading === undefined ? t("empty_heading") : heading;
	const finalDescription = description === undefined ? t("empty_description") : description;
	const sizeConfig = SIZE_CONFIGS[size] ?? SIZE_CONFIGS.md;
	const iconColorClass = ICON_COLOR_CLASSES[iconColor] ?? ICON_COLOR_CLASSES.muted;

	const renderIcon = () => {
		if (!IconProp) return null;
		if (isValidElement(IconProp)) {
			return IconProp;
		}
		const IconComponent = IconProp as ComponentType<{
			className?: string;
		}>;
		return <IconComponent className={sizeConfig.iconSizeClass} />;
	};

	const renderActions = () => {
		let actionNodes: ReactNode = null;
		if (isValidElement(actions)) {
			actionNodes = <div className="mt-1 flex items-center gap-2">{actions}</div>;
		} else if (Array.isArray(actions) && actions.length > 0) {
			actionNodes = (
				<div className="mt-1 flex flex-wrap items-center justify-center gap-2">
					{actions.map((action: TableEmptyStateAction, idx) => {
						const ActionIcon = action.icon;
						const buttonVariant = action.variant ?? (idx === 0 ? "default" : "outline");
						const buttonSize = action.size ?? sizeConfig.actionButtonSize;

						return (
							<Button
								key={`${action.label}-${idx}`}
								variant={buttonVariant}
								size={buttonSize}
								disabled={action.disabled}
								onClick={action.onClick}
								className={cn("font-medium shadow-xs transition-transform active:scale-[0.98]", action.className)}
							>
								{ActionIcon ? <ActionIcon data-icon="inline-start" /> : null}
								<span>{action.label}</span>
							</Button>
						);
					})}
				</div>
			);
		}

		if (!actionNodes) return null;
		if (customRenderActions) {
			return customRenderActions(actionNodes);
		}
		return actionNodes;
	};

	const renderedActions = renderActions();

	return (
		<Empty
			data-slot="table-empty-state"
			className={cn(
				"w-full animate-in border-0 duration-200 fade-in-50 select-none",
				sizeConfig.containerClass,
				className,
			)}
		>
			<EmptyHeader className="gap-1">
				{IconProp ? (
					<EmptyMedia
						data-slot="empty-state-icon-badge"
						className={cn(
							"mb-1 rounded-full border shadow-2xs transition-colors",
							sizeConfig.badgeClass,
							iconColorClass,
						)}
					>
						{renderIcon()}
					</EmptyMedia>
				) : null}

				{finalHeading ? (
					<EmptyTitle data-slot="empty-state-heading" className={sizeConfig.headingClass}>
						{finalHeading}
					</EmptyTitle>
				) : null}
				{finalDescription ? (
					<EmptyDescription data-slot="empty-state-description" className={sizeConfig.descriptionClass}>
						{finalDescription}
					</EmptyDescription>
				) : null}
			</EmptyHeader>

			{renderedActions ? <EmptyContent>{renderedActions}</EmptyContent> : null}

			{footer ? (
				<div data-slot="empty-state-footer" className="text-muted-foreground/70 mt-1 text-xs">
					{footer}
				</div>
			) : null}
		</Empty>
	);
}
