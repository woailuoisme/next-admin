"use client";

import type * as GeoJSON from "geojson";

import { useTranslations } from "next-intl";
import { useId, useMemo } from "react";

import type { GeoHeatmapMapProps } from "./types";

import { MapFrame, useMapBasemapState } from "../frame/MapFrame";
import { CHINA_MAP_CENTER } from "../shared/constants";
import { resolveCssColorToHex, useMapThemeTokens } from "../shared/tokenBridge";
import { isValidCoordinate, resolveCoordinateSystems, transformCoordinates } from "../utils/coordinates";
import { resolveBoundingCenter } from "../utils/geoEngine";
import { COLOR_RAMP_PRESETS } from "./colorRamps";
import { HeatmapLegend } from "./HeatmapLegend";
import { HeatmapWebGLSourceLayer } from "./HeatmapWebGLSourceLayer";

const EMPTY_HEATMAP_POINTS: NonNullable<GeoHeatmapMapProps["data"]> = [];

function parseColorChannels(color: string): [number, number, number] | null {
	const trimmed = color.trim();
	const hex6 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(trimmed);
	if (hex6) {
		return [Number.parseInt(hex6[1], 16), Number.parseInt(hex6[2], 16), Number.parseInt(hex6[3], 16)];
	}
	const hex3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(trimmed);
	if (hex3) {
		return [
			Number.parseInt(hex3[1] + hex3[1], 16),
			Number.parseInt(hex3[2] + hex3[2], 16),
			Number.parseInt(hex3[3] + hex3[3], 16),
		];
	}
	const rgbMatch = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,[\d.\s]+)?\)$/i.exec(trimmed);
	if (rgbMatch) {
		return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
	}
	return null;
}

function buildPrimaryMonoRamp(color: string, fallbackColor?: string): Array<[number, string]> {
	const channels = parseColorChannels(color) ?? (fallbackColor ? parseColorChannels(fallbackColor) : null);
	if (!channels) return COLOR_RAMP_PRESETS.mono;
	const [r, g, b] = channels;
	return [
		[0, `rgba(${r}, ${g}, ${b}, 0)`],
		[0.25, `rgba(${r}, ${g}, ${b}, 0.35)`],
		[0.5, `rgba(${r}, ${g}, ${b}, 0.65)`],
		[0.75, `rgba(${r}, ${g}, ${b}, 0.85)`],
		[1, `rgba(${r}, ${g}, ${b}, 1)`],
	];
}

export function GeoHeatmapMap({
	data,
	points,
	coordinateSystem = "WGS84",
	center,
	zoom = 3.8,
	pitch,
	bearing,
	projection,
	basemap = "carto",
	basemapCRS,
	onBasemapChange,
	customStyleUrl,
	blank = false,
	interactive = true,
	autoFitBounds = false,
	radius = 28,
	maxIntensity = 1,
	weightProperty = "weight",
	colorRamp = "thermal",
	customColorRamp,
	opacity = 0.85,
	showLegend = true,
	legendTitle,
	height = 480,
	className,
	cardProps,
	isLoading = false,
	isEmpty = false,
	isError = false,
	error,
	errorMessage,
	emptyMessage,
	onRetry,
}: GeoHeatmapMapProps) {
	const t = useTranslations("map");
	const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);
	const tokens = useMapThemeTokens();

	const sourceId = useId();
	const layerId = `heatmap-layer-${sourceId}`;

	const rawPoints = data ?? points ?? EMPTY_HEATMAP_POINTS;

	const { sourceCoords, targetCoords } = resolveCoordinateSystems(coordinateSystem, activeBasemap, basemapCRS);

	// 避免大批量热力点坐标转换与 GeoJSON 组装重复计算
	const { geojsonData, transformedPoints } = useMemo(() => {
		const validPoints: [number, number][] = [];
		const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

		for (let index = 0; index < rawPoints.length; index += 1) {
			const pt = rawPoints[index];
			if (!isValidCoordinate(pt?.coordinates)) continue;

			const coords = transformCoordinates(pt.coordinates, sourceCoords, targetCoords);
			if (!isValidCoordinate(coords)) continue;

			const weight = typeof pt.weight === "number" && Number.isFinite(pt.weight) ? pt.weight : 1;
			validPoints.push(coords);
			features.push({
				type: "Feature",
				id: pt.id ?? index,
				properties: {
					...pt.extra,
					[weightProperty]: weight,
				},
				geometry: {
					type: "Point",
					coordinates: coords,
				},
			});
		}

		return {
			geojsonData: { type: "FeatureCollection" as const, features },
			transformedPoints: validPoints,
		};
	}, [rawPoints, sourceCoords, targetCoords, weightProperty]);

	const activeStops: Array<[number, string]> =
		customColorRamp && customColorRamp.length >= 2
			? customColorRamp.map(([stop, color]) => [stop, resolveCssColorToHex(color, tokens.primary)])
			: colorRamp === "mono"
				? buildPrimaryMonoRamp(tokens.primary, tokens.primaryRamp[4])
				: (COLOR_RAMP_PRESETS[colorRamp] ?? COLOR_RAMP_PRESETS.thermal);

	const computedCenter = resolveBoundingCenter(transformedPoints, center, CHINA_MAP_CENTER);

	const overlaySlot = showLegend ? (
		<HeatmapLegend legendTitle={legendTitle} stops={activeStops} maxIntensity={maxIntensity} />
	) : null;

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
			fitBoundsPoints={autoFitBounds ? transformedPoints : undefined}
			height={height}
			className={className}
			isLoading={isLoading}
			isEmpty={isEmpty || (!isLoading && transformedPoints.length === 0)}
			isError={isError}
			error={error}
			errorMessage={errorMessage || (isError || error ? t("heatmap_error") : undefined)}
			emptyMessage={emptyMessage ?? t("heatmap_empty")}
			onRetry={onRetry}
			defaultCardTitle={t("heatmap_card_title")}
			defaultCardDescription={t("heatmap_card_desc")}
			cardProps={cardProps}
			ariaLabel={t("heatmap_card_title")}
			overlaySlot={overlaySlot}
		>
			<HeatmapWebGLSourceLayer
				sourceId={sourceId}
				layerId={layerId}
				geojsonData={geojsonData}
				radius={radius}
				maxIntensity={maxIntensity}
				weightProperty={weightProperty}
				stops={activeStops}
				opacity={opacity}
			/>
		</MapFrame>
	);
}
