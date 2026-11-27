"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemoizedFn } from "ahooks";
import { Maximize2 } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

import type { MapCardProps } from "./types";

import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { MapBasemapDropdown } from "./MapBasemapDropdown";

const MapFullscreenDialog = dynamic(() => import("./MapFullscreenDialog").then((mod) => mod.MapFullscreenDialog), {
	ssr: false,
});

const subscribeNoop = () => () => {};
const getIsClient = () => true;
const getIsServer = () => false;

export function MapCard({
	title,
	description,
	actionSlot,
	legendSlot,
	footerSlot,
	basemap = "carto",
	onBasemapChange,
	showBasemapSelector = true,
	showFullscreen = true,
	fullscreenable,
	height = 450,
	fullscreenHeight = "calc(90vh - 80px)",
	isLoading = false,
	loadingMessage,
	isEmpty = false,
	emptyMessage,
	isError = false,
	error,
	errorMessage,
	onRetry,
	className,
	children,
}: MapCardProps) {
	const t = useTranslations("map");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hasOpenedFullscreen, setHasOpenedFullscreen] = useState(false);

	/**
	 * 单一持久化 WebGL 宿主节点：进入/退出全屏仅将该 DOM 节点在卡片槽位与 Dialog 槽位间移动，
	 * 绝不卸载重挂载 <Map> 实例，彻底保全 WebGL 上下文、相机视角与叠加图层。
	 */
	const [hostEl] = useState<HTMLDivElement | null>(() => {
		if (typeof document === "undefined") return null;
		const el = document.createElement("div");
		el.className = "size-full";
		return el;
	});

	useEffect(() => {
		return () => {
			hostEl?.remove();
		};
	}, [hostEl]);

	// 稳定 Portal DOM ref 回调，并在全屏状态切换时将宿主节点精确迁移至目标槽位
	const attachCardSlot = useCallback(
		(slot: HTMLDivElement | null) => {
			if (slot && hostEl && !isFullscreen && hostEl.parentNode !== slot) {
				slot.appendChild(hostEl);
			}
		},
		[hostEl, isFullscreen],
	);

	// 稳定 Portal DOM ref 回调，避免 Dialog 内容挂载时重复迁移宿主节点
	const attachDialogSlot = useCallback(
		(slot: HTMLDivElement | null) => {
			if (slot && hostEl && isFullscreen && hostEl.parentNode !== slot) {
				slot.appendChild(hostEl);
			}
		},
		[hostEl, isFullscreen],
	);

	const openFullscreen = useMemoizedFn(() => {
		setHasOpenedFullscreen(true);
		setIsFullscreen(true);
	});
	const canFullscreen = fullscreenable ?? showFullscreen;
	const hasError = Boolean(isError || error);
	const errorDetail = error instanceof Error ? error.message : typeof error === "string" ? error : undefined;
	const resolvedErrorMsg = errorMessage || errorDetail || (hasError ? t("error_default") : undefined);
	const isClient = useSyncExternalStore(subscribeNoop, getIsClient, getIsServer);
	const shouldRenderMap = isClient && !isLoading && !hasError && !isEmpty;

	return (
		<>
			<Card className={cn("flex flex-col overflow-hidden shadow-xs", className)}>
				<CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 flex-col gap-1">
						<CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
						{description ? (
							<CardDescription className="text-muted-foreground text-xs">{description}</CardDescription>
						) : null}
					</div>

					<div className="flex shrink-0 flex-wrap items-center gap-1.5">
						{legendSlot}

						{showBasemapSelector && onBasemapChange ? (
							<MapBasemapDropdown basemap={basemap} onBasemapChange={onBasemapChange} />
						) : null}

						{actionSlot}

						{canFullscreen ? (
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={openFullscreen}
								disabled={isLoading || isEmpty || hasError}
								className="text-muted-foreground hover:text-foreground"
								title={t("fullscreen_title")}
								aria-label={t("fullscreen_title")}
							>
								<Maximize2 aria-hidden="true" />
							</Button>
						) : null}
					</div>
				</CardHeader>

				<CardContent className="min-w-0 flex-1 pt-2 pb-5">
					{isLoading ? (
						<MapSkeleton height={height} message={loadingMessage} />
					) : hasError ? (
						<MapEmptyState
							height={height}
							type="error"
							message={resolvedErrorMsg}
							actionLabel={onRetry ? t("retry") : undefined}
							onAction={onRetry}
						/>
					) : isEmpty ? (
						<MapEmptyState height={height} type="no-data" message={emptyMessage} />
					) : (
						<div className="border-border/40 relative w-full overflow-hidden rounded-lg border" style={{ height }}>
							{isFullscreen ? (
								<div className="bg-muted/20 text-muted-foreground flex size-full items-center justify-center text-xs">
									{t("fullscreen_active")}
								</div>
							) : (
								<div ref={attachCardSlot} className="size-full" />
							)}
						</div>
					)}
				</CardContent>

				{footerSlot ? <CardFooter className="border-border/40 bg-transparent">{footerSlot}</CardFooter> : null}
			</Card>

			{shouldRenderMap && hostEl ? createPortal(children, hostEl) : null}

			{canFullscreen && hasOpenedFullscreen ? (
				<MapFullscreenDialog
					open={isFullscreen}
					onOpenChange={setIsFullscreen}
					title={title}
					description={description}
					fullscreenHeight={fullscreenHeight}
					onHostMount={attachDialogSlot}
				/>
			) : null}
		</>
	);
}
