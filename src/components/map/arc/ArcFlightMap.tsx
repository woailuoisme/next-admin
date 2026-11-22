"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { useSyncExternalStore } from "react";

import { MapArc } from "@/components/ui/map";

import type { ArcFlightItem, ArcFlightMapProps } from "./types";

import { MapFrame, useMapBasemapState } from "../frame/MapFrame";
import { type LeafHoverStore, useLeafHoverStore } from "../shared/useLeafHoverStore";
import { ArcDetailCard } from "./ArcDetailCard";
import { ArcNodeMarker } from "./ArcNodeMarker";
import { ArcSplitLineLayer } from "./ArcSplitLineLayer";
import { type ResolvedArcItem, useArcTopology } from "./useArcTopology";

const EMPTY_ARCS: ArcFlightItem[] = [];

function ArcHoverLeaf({ store }: { store: LeafHoverStore<ArcFlightItem> }) {
	const hoveredArc = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
	return <ArcDetailCard arc={hoveredArc} />;
}

export function ArcFlightMap({
	data = EMPTY_ARCS,
	coordinateSystem = "WGS84",
	arcColor,
	arcHoverColor,
	arcWidth = 2,
	hoverArcWidth,
	arcOpacity = 0.72,
	curvature = 0.25,
	samples = 64,
	showNodes = true,
	nodeSize = 10,
	onArcHover,
	onArcClick,
	cardProps,
	center,
	zoom = 3,
	pitch = 25,
	bearing,
	projection = "globe",
	basemap = "carto",
	basemapCRS,
	onBasemapChange,
	customStyleUrl,
	blank = false,
	interactive = true,
	autoFitBounds = false,
	height = 480,
	className,
	isLoading = false,
	isEmpty = false,
	isError = false,
	error,
	errorMessage,
	emptyMessage,
	onRetry,
}: ArcFlightMapProps) {
	const t = useTranslations("map");
	const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);
	const { store: hoverStore, setHovered } = useLeafHoverStore<ArcFlightItem>((a, b) => a?.id === b?.id);

	const setHoveredArc = useMemoizedFn((arc: ArcFlightItem | null) => {
		setHovered(arc);
		onArcHover?.(arc);
	});

	const effectiveHoverWidth = hoverArcWidth ?? arcWidth + 2;

	const { arcsData, arcLookup, nodes, allPoints, computedCenter, resolvedArcColor, resolvedHoverColor } =
		useArcTopology({
			data,
			coordinateSystem,
			activeBasemap,
			basemapCRS,
			center,
			arcColor,
			arcHoverColor,
		});

	const handleGlobeHover = useMemoizedFn((e: { arc: { id: string | number } } | null) => {
		setHoveredArc(e ? (arcLookup.get(String(e.arc.id)) ?? null) : null);
	});

	const handleGlobeClick = useMemoizedFn((e: { arc: { id: string | number } }) => {
		const match = arcLookup.get(String(e.arc.id));
		if (match) onArcClick?.(match);
	});

	const handleMercatorHover = useMemoizedFn((arc: ResolvedArcItem | null) => {
		setHoveredArc(arc?.rawArc ?? null);
	});

	const handleMercatorClick = useMemoizedFn((arc: ResolvedArcItem) => {
		onArcClick?.(arc.rawArc);
	});

	const isGlobeProjection = projection === "globe";

	const overlaySlot = <ArcHoverLeaf store={hoverStore} />;

	return (
		<MapFrame
			center={computedCenter}
			zoom={zoom}
			pitch={pitch}
			bearing={bearing}
			projection={projection}
			basemap={activeBasemap}
			onBasemapChange={handleBasemapChange}
			customStyleUrl={customStyleUrl}
			blank={blank}
			interactive={interactive}
			autoFitBounds={autoFitBounds}
			fitBoundsPoints={autoFitBounds ? allPoints : undefined}
			height={height}
			className={className}
			isLoading={isLoading}
			isEmpty={isEmpty || (!isLoading && arcsData.length === 0)}
			isError={isError}
			error={error}
			errorMessage={errorMessage || (isError || error ? t("arc_error") : undefined)}
			emptyMessage={emptyMessage ?? t("arc_empty")}
			onRetry={onRetry}
			defaultCardTitle={t("arc_card_title")}
			defaultCardDescription={t("arc_card_desc")}
			cardProps={cardProps}
			ariaLabel={t("arc_card_title")}
			overlaySlot={overlaySlot}
		>
			{isGlobeProjection ? (
				<MapArc
					data={arcsData}
					curvature={curvature}
					interactive={interactive}
					paint={{
						"line-color": ["coalesce", ["get", "color"], resolvedArcColor],
						"line-width": arcWidth,
						"line-opacity": arcOpacity,
					}}
					hoverPaint={{
						"line-color": resolvedHoverColor,
						"line-width": effectiveHoverWidth,
						"line-opacity": 1,
					}}
					onHover={handleGlobeHover}
					onClick={handleGlobeClick}
				/>
			) : (
				<ArcSplitLineLayer
					data={arcsData}
					curvature={curvature}
					samples={samples}
					arcColor={resolvedArcColor}
					arcHoverColor={resolvedHoverColor}
					arcWidth={arcWidth}
					hoverArcWidth={effectiveHoverWidth}
					arcOpacity={arcOpacity}
					interactive={interactive}
					onHover={handleMercatorHover}
					onClick={handleMercatorClick}
				/>
			)}

			{showNodes
				? nodes.map((node) => <ArcNodeMarker key={node.id} node={node} size={nodeSize} arcColor={resolvedArcColor} />)
				: null}
		</MapFrame>
	);
}
