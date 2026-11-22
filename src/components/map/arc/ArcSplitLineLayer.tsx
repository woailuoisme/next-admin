"use client";

import type * as MapLibreGL from "maplibre-gl";

import { memo, useEffect, useId, useMemo, useRef } from "react";

import { useMap } from "@/components/ui/map";

import { buildArcFeatureCollection, buildArcPaintSpecs } from "./arcLayerSpecs";
import type { ResolvedArcItem } from "./useArcTopology";

export interface ArcSplitLineLayerProps {
	data: ResolvedArcItem[];
	curvature?: number;
	samples?: number;
	arcColor: string;
	arcHoverColor: string;
	arcWidth: number;
	hoverArcWidth?: number;
	arcOpacity?: number;
	interactive?: boolean;
	onHover?: (arc: ResolvedArcItem | null) => void;
	onClick?: (arc: ResolvedArcItem) => void;
}

export const ArcSplitLineLayer = memo(function ArcSplitLineLayer({
	data,
	curvature = 0.25,
	samples = 64,
	arcColor,
	arcHoverColor,
	arcWidth,
	hoverArcWidth,
	arcOpacity = 0.72,
	interactive = true,
	onHover,
	onClick,
}: ArcSplitLineLayerProps) {
	const { map, isLoaded } = useMap();
	const autoId = useId();
	const sourceId = `arc-split-src-${autoId}`;
	const lineLayerId = `arc-split-line-${autoId}`;
	const hitLayerId = `arc-split-hit-${autoId}`;

	const latestRef = useRef({ onHover, onClick, data });
	latestRef.current = { onHover, onClick, data };

	const arcIndexMap = useMemo(() => new Map(data.map((arc) => [arc.id, arc])), [data]);
	const arcIndexRef = useRef(arcIndexMap);
	arcIndexRef.current = arcIndexMap;

	const geojson = useMemo(() => buildArcFeatureCollection(data, curvature, samples), [curvature, data, samples]);
	const latestGeojsonRef = useRef(geojson);
	latestGeojsonRef.current = geojson;

	const effectiveHoverWidth = hoverArcWidth ?? arcWidth + 2;
	const paintSpecs = useMemo(
		() => buildArcPaintSpecs(arcColor, arcHoverColor, arcWidth, effectiveHoverWidth, arcOpacity),
		[arcColor, arcHoverColor, arcOpacity, arcWidth, effectiveHoverWidth],
	);
	const latestPaintRef = useRef(paintSpecs);
	latestPaintRef.current = paintSpecs;

	useEffect(() => {
		if (!isLoaded || !map) return;

		const initialPaint = latestPaintRef.current;

		if (!map.getSource(sourceId)) {
			map.addSource(sourceId, { type: "geojson", data: latestGeojsonRef.current, promoteId: "id" });
		}

		if (!map.getLayer(lineLayerId)) {
			map.addLayer({
				id: lineLayerId,
				type: "line",
				source: sourceId,
				layout: { "line-join": "round", "line-cap": "round" },
				paint: {
					"line-color": initialPaint.lineColor,
					"line-width": initialPaint.lineWidth,
					"line-opacity": initialPaint.lineOpacity,
				},
			});
		}

		if (!map.getLayer(hitLayerId)) {
			map.addLayer({
				id: hitLayerId,
				type: "line",
				source: sourceId,
				layout: { "line-join": "round", "line-cap": "round" },
				paint: {
					"line-color": initialPaint.hitLineColor,
					"line-opacity": 0,
					"line-width": initialPaint.hitLineWidth,
				},
			});
		}

		return () => {
			try {
				if (map.getLayer(hitLayerId)) map.removeLayer(hitLayerId);
				if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
				if (map.getSource(sourceId)) map.removeSource(sourceId);
			} catch {
				// 样式重建期间忽略清理异常
			}
		};
	}, [isLoaded, map, sourceId, lineLayerId, hitLayerId]);

	useEffect(() => {
		if (!isLoaded || !map) return;
		const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
		source?.setData(geojson);
	}, [geojson, isLoaded, map, sourceId]);

	useEffect(() => {
		if (!isLoaded || !map || !map.getSource(sourceId) || !map.getLayer(lineLayerId)) return;
		map.setPaintProperty(lineLayerId, "line-color", paintSpecs.lineColor);
		map.setPaintProperty(lineLayerId, "line-width", paintSpecs.lineWidth);
		map.setPaintProperty(lineLayerId, "line-opacity", paintSpecs.lineOpacity);
		if (map.getLayer(hitLayerId)) {
			map.setPaintProperty(hitLayerId, "line-width", paintSpecs.hitLineWidth);
		}
	}, [hitLayerId, isLoaded, lineLayerId, map, paintSpecs, sourceId]);

	useEffect(() => {
		if (!isLoaded || !map || !interactive) return;

		let hoveredId: string | number | null = null;

		const setHover = (nextId: string | number | null) => {
			if (nextId === hoveredId) return;
			const sourceExists = !!map.getSource(sourceId);
			if (hoveredId != null && sourceExists) {
				map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
			}
			hoveredId = nextId;
			if (nextId != null && sourceExists) {
				map.setFeatureState({ source: sourceId, id: nextId }, { hover: true });
			}
		};

		const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
			const feature = e.features?.[0];
			if (!feature) return;
			map.getCanvas().style.cursor = "pointer";
			const rawId = feature.properties?.id ?? feature.id;
			const featureId = rawId != null ? String(rawId) : undefined;
			if (!featureId || featureId === hoveredId) return;
			setHover(featureId);
			latestRef.current.onHover?.(arcIndexRef.current.get(featureId) ?? null);
		};

		const handleMouseLeave = () => {
			setHover(null);
			map.getCanvas().style.cursor = "";
			latestRef.current.onHover?.(null);
		};

		const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
			const feature = e.features?.[0];
			const rawId = feature?.properties?.id ?? feature?.id;
			const featureId = rawId != null ? String(rawId) : undefined;
			if (!featureId) return;
			const match = arcIndexRef.current.get(featureId);
			if (match) latestRef.current.onClick?.(match);
		};

		map.on("mousemove", hitLayerId, handleMouseMove);
		map.on("mouseleave", hitLayerId, handleMouseLeave);
		map.on("click", hitLayerId, handleClick);

		return () => {
			try {
				map.off("mousemove", hitLayerId, handleMouseMove);
				map.off("mouseleave", hitLayerId, handleMouseLeave);
				map.off("click", hitLayerId, handleClick);
				setHover(null);
				map.getCanvas().style.cursor = "";
			} catch {
				// 地图卸载或样式重建阶段忽略底层清理异常
			}
		};
	}, [hitLayerId, interactive, isLoaded, map, sourceId]);

	return null;
});
