"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, MapPinOff, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "cn";

export interface MapEmptyStateProps {
	height?: number | string;
	title?: string;
	description?: string;
	message?: string;
	type?: "no-data" | "error";
	action?: ReactNode;
	actionLabel?: string;
	onAction?: () => void;
	className?: string;
}

export function MapEmptyState({
	height = 400,
	title,
	description,
	message,
	type = "no-data",
	action,
	actionLabel,
	onAction,
	className,
}: MapEmptyStateProps) {
	const t = useTranslations("map");
	const isError = type === "error";

	const resolvedTitle = title ?? (isError ? t("error_default") : t("empty_title"));
	const resolvedDesc = message ?? description ?? (isError ? t("error_tile_timeout") : t("empty_desc"));

	return (
		<Empty
			className={cn(
				"relative flex-none rounded-lg border border-border/70 select-none",
				isError ? "border-destructive/30 bg-destructive/5" : "bg-muted/10",
				className,
			)}
			style={{ height }}
			role={isError ? "alert" : "status"}
		>
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className={cn(
						"size-12 rounded-full [&_svg:not([class*='size-'])]:size-6",
						isError ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
					)}
				>
					{isError ? (
						<AlertCircle aria-hidden="true" className="stroke-[1.5]" />
					) : (
						<MapPinOff aria-hidden="true" className="stroke-[1.5]" />
					)}
				</EmptyMedia>

				<EmptyTitle className={cn("font-sans text-sm font-semibold", isError ? "text-destructive" : "text-foreground")}>
					{resolvedTitle}
				</EmptyTitle>
				<EmptyDescription className={cn("text-xs", isError ? "text-destructive/80" : "text-muted-foreground")}>
					{resolvedDesc}
				</EmptyDescription>
			</EmptyHeader>

			{action ? (
				<EmptyContent>{action}</EmptyContent>
			) : actionLabel && onAction ? (
				<EmptyContent>
					<Button variant={isError ? "destructive" : "outline"} size="sm" onClick={onAction}>
						{isError ? <RefreshCw data-icon="inline-start" aria-hidden="true" /> : null}
						{actionLabel}
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
