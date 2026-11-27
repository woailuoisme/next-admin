"use client";

import { useTranslations } from "next-intl";

import type { ComponentType, ReactNode } from "react";

import { BarChart3 } from "lucide-react";

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "cn";

export interface ChartEmptyStateProps {
	message?: string;
	description?: string;
	icon?: ComponentType<{ className?: string }>;
	actionSlot?: ReactNode;
	height?: number | string;

	className?: string;
}

export function ChartEmptyState({
	message,
	description,
	icon: Icon = BarChart3,
	actionSlot,
	height = 240,
	className,
}: ChartEmptyStateProps) {
	const t = useTranslations("chart");
	const displayMessage = message ?? t("empty_title");
	const displayDescription = description ?? (message === undefined ? t("empty_desc") : undefined);

	return (
		<Empty
			className={cn("justify-center border-0 select-none", className)}
			style={{ minHeight: height }}
			role="status"
			aria-live="polite"
		>
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className="border-border/40 bg-muted/60 text-muted-foreground/60 rounded-full border"
				>
					<Icon aria-hidden="true" />
				</EmptyMedia>
				<EmptyTitle className="text-muted-foreground">{displayMessage}</EmptyTitle>
				{displayDescription && <EmptyDescription className="text-xs">{displayDescription}</EmptyDescription>}
			</EmptyHeader>
			{actionSlot && <EmptyContent>{actionSlot}</EmptyContent>}
		</Empty>
	);
}
