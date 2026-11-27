"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ModalFrame } from "@/components/dialogs/ModalFrame";
import { Badge } from "@/components/ui/badge";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface MapFullscreenDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	fullscreenHeight?: string | number;
	/** 由持久化 Portal 模式传入的全屏画布挂载槽位回调 */
	onHostMount?: (slot: HTMLDivElement | null) => void;
	children?: ReactNode;
}

export function MapFullscreenDialog({
	open,
	onOpenChange,
	title,
	description,
	fullscreenHeight = "calc(90vh - 80px)",
	onHostMount,
	children,
}: MapFullscreenDialogProps) {
	const t = useTranslations("map");

	return (
		<ModalFrame
			open={open}
			onOpenChange={onOpenChange}
			size="full"
			widthClassName="flex h-[92vh] max-h-[95vh] w-[95vw] max-w-7xl flex-col overflow-hidden p-0 sm:max-w-7xl"
			headerSlot={
				<div className="flex flex-col gap-1">
					<DialogTitle className="flex items-center gap-2 text-lg leading-none font-semibold">
						<span>{title}</span>
						<Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
							{t("fullscreen_badge")}
						</Badge>
					</DialogTitle>
					{description ? (
						<DialogDescription className="text-muted-foreground text-xs">{description}</DialogDescription>
					) : null}
				</div>
			}
		>
			<div className="min-h-0 flex-1 p-4">
				<div
					ref={onHostMount}
					className="border-border/60 relative size-full overflow-hidden rounded-lg border"
					style={{ maxHeight: fullscreenHeight }}
				>
					{onHostMount ? null : children}
				</div>
			</div>
		</ModalFrame>
	);
}
