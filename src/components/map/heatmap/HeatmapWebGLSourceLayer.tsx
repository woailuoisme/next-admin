"use client";

import type * as GeoJSON from "geojson";
import type * as MapLibreGL from "maplibre-gl";

import { memo, useEffect, useMemo, useRef } from "react";

import { useMap } from "@/components/ui/map";

import { buildHeatmapColorExpression } from "./colorRamps";

export interface HeatmapWebGLSourceLayerProps {
	sourceId: string;
	layerId: string;
	geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point>;
	radius: number;
	maxIntensity: number;
	weightProperty: string;
	stops: Array<[number, string]>;
	opacity: number;
}

export const HeatmapWebGLSourceLayer = memo(function HeatmapWebGLSourceLayer({
	sourceId,
	layerId,
	geojsonData,
	radius,
	maxIntensity,
	weightProperty,
	stops,
	opacity,
}: HeatmapWebGLSourceLayerProps) {
	const { map, isLoaded } = useMap();

	const safeMaxIntensity = Math.max(0.01, Number.isFinite(maxIntensity) ? maxIntensity : 1);
	const safeRadius = Math.max(1, Number.isFinite(radius) ? radius : 25);
	const safeOpacity = Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 0.85));

	const heatmapWeightExpr = useMemo(
		() =>
			[
				"interpolate",
				["linear"],
				["coalesce", ["to-number", ["get", weightProperty]], 1],
				0,
				0,
				safeMaxIntensity,
				1,
			] as MapLibreGL.ExpressionSpecification,
		[safeMaxIntensity, weightProperty],
	);

	const heatmapRadiusExpr = useMemo(
		() =>
			[
				"interpolate",
				["linear"],
				["zoom"],
				0,
				Math.max(2, Math.round(safeRadius * 0.45)),
				9,
				safeRadius,
				15,
				Math.round(safeRadius * 1.4),
			] as MapLibreGL.ExpressionSpecification,
		[safeRadius],
	);

	const heatmapColorExpr = useMemo(() => buildHeatmapColorExpression(stops), [stops]);

	const heatmapOpacityExpr = useMemo(
		() =>
			[
				"interpolate",
				["linear"],
				["zoom"],
				7,
				safeOpacity,
				16,
				safeOpacity * 0.65,
			] as MapLibreGL.ExpressionSpecification,
		[safeOpacity],
	);

	const latestGeojsonRef = useRef(geojsonData);
	latestGeojsonRef.current = geojsonData;

	const latestPaintRef = useRef({
		weight: heatmapWeightExpr,
		radius: heatmapRadiusExpr,
		color: heatmapColorExpr,
		opacity: heatmapOpacityExpr,
	});
	latestPaintRef.current = {
		weight: heatmapWeightExpr,
		radius: heatmapRadiusExpr,
		color: heatmapColorExpr,
		opacity: heatmapOpacityExpr,
	};

	// Effect 1: 仅挂载热力数据源与 WebGL 图层，不在调参时销毁重建
	useEffect(() => {
		if (!isLoaded || !map) return;

		if (!map.getSource(sourceId)) {
			map.addSource(sourceId, {
				type: "geojson",
				data: latestGeojsonRef.current,
			});
		}

		if (!map.getLayer(layerId)) {
			const paint = latestPaintRef.current;
			map.addLayer({
				id: layerId,
				type: "heatmap",
				source: sourceId,
				maxzoom: 16,
				paint: {
					"heatmap-weight": paint.weight,
					"heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 2.5, 15, 3.5],
					"heatmap-color": paint.color,
					"heatmap-radius": paint.radius,
					"heatmap-opacity": paint.opacity,
				},
			});
		}

		return () => {
			try {
				if (map.getLayer(layerId)) map.removeLayer(layerId);
				if (map.getSource(sourceId)) map.removeSource(sourceId);
			} catch {
				// 样式重建期间忽略清理异常
			}
		};
	}, [isLoaded, map, sourceId, layerId]);

	// Effect 2: 独立同步 GeoJSON 点集数据
	useEffect(() => {
		if (!isLoaded || !map) return;
		const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
		source?.setData(geojsonData);
	}, [geojsonData, isLoaded, map, sourceId]);

	// Effect 3: 增量热更新图层 paint 属性（滑动半径/切换色带零重绘闪烁）
	useEffect(() => {
		if (!isLoaded || !map || !map.getLayer(layerId)) return;
		map.setPaintProperty(layerId, "heatmap-weight", heatmapWeightExpr);
		map.setPaintProperty(layerId, "heatmap-color", heatmapColorExpr);
		map.setPaintProperty(layerId, "heatmap-radius", heatmapRadiusExpr);
		map.setPaintProperty(layerId, "heatmap-opacity", heatmapOpacityExpr);
	}, [heatmapColorExpr, heatmapOpacityExpr, heatmapRadiusExpr, heatmapWeightExpr, isLoaded, layerId, map]);

	return null;
});
