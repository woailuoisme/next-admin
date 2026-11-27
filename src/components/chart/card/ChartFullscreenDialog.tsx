"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { ChartHeight } from "../shared/types";

import { ChartProvider } from "../shared/ChartContext";

export interface ChartFullscreenDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: ReactNode;
	description?: ReactNode;
	fullscreenHeight: ChartHeight;
	children: ReactNode;
}

export function ChartFullscreenDialog({
	open,
	onOpenChange,
	title,
	description,
	fullscreenHeight,
	children,
}: ChartFullscreenDialogProps) {
	const t = useTranslations("chart");
	const hasTitle = title !== undefined && title !== null && title !== "";
	const hasDescription = description !== undefined && description !== null && description !== "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{/* 补 sm:max-w-5xl：DialogContent 基础含 sm:max-w-sm，裸 max-w-5xl 不在同一合并组内会被击败 */}
			<DialogContent className="max-w-5xl p-6 sm:max-w-5xl sm:rounded-xl">
				<DialogHeader className="pb-2">
					{hasTitle ? (
						<DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
					) : (
						<DialogTitle className="sr-only">{t("fullscreen_title")}</DialogTitle>
					)}
					{hasDescription ? (
						<DialogDescription className="text-muted-foreground text-xs">{description}</DialogDescription>
					) : null}
				</DialogHeader>
				<div className="w-full min-w-0 pt-2" style={{ minHeight: fullscreenHeight }}>
					{open ? (
						<ChartProvider height={fullscreenHeight} isFullscreen>
							{children}
						</ChartProvider>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
