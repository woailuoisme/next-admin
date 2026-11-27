"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { type ReactNode, useState } from "react";

import { Map, MapControls } from "@/components/ui/map";
import { cn } from "cn";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { CHINA_MAP_CENTER, MAP_ATTRIBUTION_PROPS } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapFitBounds } from "../shared/MapFitBounds";
import { MapSkeleton } from "../shared/MapSkeleton";
import type { Coordinates, MapCardSlotProps, MapCommonProps, MapFeedbackProps } from "../shared/types";
import { isValidCoordinate } from "../utils/coordinates";
import { MapRuntimeWatcher, MapTileWarningBanner, useMapBasemapState } from "./MapFrameSupport";

export { useMapBasemapState };

export interface MapFrameProps extends MapCommonProps, MapFeedbackProps {
	defaultCardTitle?: ReactNode;
	defaultCardDescription?: ReactNode;
	cardProps?: MapCardSlotProps;
	fallbackCenter?: Coordinates;
	fitBoundsPoints?: readonly Coordinates[];
	ariaLabel?: string;
	overlaySlot?: ReactNode;
	afterMapSlot?: ReactNode;
	children?: ReactNode;
}

/**
 * MapFrame：收口业务地图外壳的深模块，统一托管错误拦截至空态/骨架状态机、受控底图与全屏 Portal。
 */
export function MapFrame({
	height = 460,
	className,
	basemap = "carto",
	onBasemapChange,
	customStyleUrl,
	blank = false,
	center,
	fallbackCenter = CHINA_MAP_CENTER,
	zoom = 11,
	pitch,
	bearing,
	interactive = true,
	projection,
	autoFitBounds = false,
	fitBoundsPoints,
	isLoading = false,
	isEmpty = false,
	isError = false,
	error,
	errorMessage,
	emptyMessage,
	onRetry,
	cardProps,
	defaultCardTitle,
	defaultCardDescription,
	ariaLabel,
	overlaySlot,
	afterMapSlot,
	children,
}: MapFrameProps) {
	const t = useTranslations("map");
	const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);

	const [tileWarning, setTileWarning] = useState<string | null>(null);
	const [mapResetEpoch, setMapResetEpoch] = useState(0);

	const basemapConfig = resolveBasemapConfig(activeBasemap, customStyleUrl);

	const safeCenter: Coordinates = isValidCoordinate(center)
		? center
		: isValidCoordinate(fallbackCenter)
			? fallbackCenter
			: CHINA_MAP_CENTER;

	const mapProjection = projection ? { type: projection } : undefined;

	const handleRuntimeError = useMemoizedFn((msg: string) => setTileWarning(msg));
	const handleTileRetry = useMemoizedFn(() => {
		setTileWarning(null);
		setMapResetEpoch((n) => n + 1);
		onRetry?.();
	});

	const hasFatalError = Boolean(isError || error);
	const errorDetail = error instanceof Error ? error.message : typeof error === "string" ? error : undefined;
	const resolvedErrorMsg = errorMessage || errorDetail || (hasFatalError ? t("error_default") : undefined);

	const standaloneContent = isLoading ? (
		<MapSkeleton height="100%" />
	) : hasFatalError ? (
		<MapEmptyState
			height="100%"
			type="error"
			message={resolvedErrorMsg}
			actionLabel={onRetry ? t("retry") : undefined}
			onAction={onRetry}
		/>
	) : isEmpty ? (
		<MapEmptyState height="100%" type="no-data" message={emptyMessage} />
	) : null;

	const mapCanvasBody = (
		<div
			className={cn("relative flex size-full overflow-hidden rounded-xl bg-muted/20", className)}
			role="region"
			aria-label={ariaLabel || (typeof cardProps?.title === "string" ? cardProps.title : t("aria_map_region"))}
		>
			{standaloneContent && !cardProps ? (
				standaloneContent
			) : (
				<>
					<div className="relative h-full min-w-0 flex-1 overflow-hidden">
						<Map
							key={`map-engine-${mapResetEpoch}`}
							center={safeCenter}
							zoom={zoom}
							pitch={pitch}
							bearing={bearing}
							projection={mapProjection}
							{...MAP_ATTRIBUTION_PROPS}
							styles={basemapConfig.styles}
							blank={blank || basemapConfig.blank}
							interactive={interactive}
							className="size-full"
						>
							<MapAutoResizer />
							<MapRuntimeWatcher onRuntimeError={handleRuntimeError} />
							{autoFitBounds && fitBoundsPoints ? <MapFitBounds points={fitBoundsPoints} enabled /> : null}
							<MapControls position="bottom-right" showZoom showCompass showLocate />
							{children}
						</Map>

						{tileWarning ? (
							<MapTileWarningBanner onRetry={handleTileRetry} onDismiss={() => setTileWarning(null)} />
						) : null}

						{overlaySlot}
					</div>

					{afterMapSlot}
				</>
			)}
		</div>
	);

	if (cardProps) {
		return (
			<MapCard
				height={height}
				title={cardProps.title || defaultCardTitle || t("aria_map_region")}
				description={cardProps.description ?? defaultCardDescription}
				fullscreenable={cardProps.fullscreenable}
				showBasemapSelector={cardProps.showBasemapSelector ?? true}
				actionSlot={cardProps.actionSlot}
				legendSlot={cardProps.legendSlot}
				footerSlot={cardProps.footerSlot}
				basemap={activeBasemap}
				onBasemapChange={handleBasemapChange}
				isLoading={isLoading}
				isError={hasFatalError}
				error={error}
				errorMessage={resolvedErrorMsg}
				isEmpty={isEmpty}
				emptyMessage={emptyMessage}
				onRetry={onRetry}
			>
				{mapCanvasBody}
			</MapCard>
		);
	}

	return (
		<div className="w-full" style={{ height }}>
			{mapCanvasBody}
		</div>
	);
}
