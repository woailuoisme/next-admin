"use client";

import { useEffect, useRef } from "react";

import { useMap } from "@/components/ui/map";

import type { Coordinates } from "./types";

import { computeBounds } from "../utils/geoEngine";

export interface MapFitBoundsProps {
	/** 待适配坐标点列表（需已转换为当前底图坐标系） */
	points: readonly Coordinates[];
	/** 是否开启自动拟合边界框 */
	enabled?: boolean;
	/** 边距像素（默认 48） */
	padding?: number;
	/** 单点或紧凑区域拟合时的最大缩放（默认 13） */
	maxZoom?: number;
	/** 过渡动画时长 ms（默认 600） */
	duration?: number;
}

/**
 * 无渲染边界框自适应控制器：在数据就绪或集合规模变化时自动将视野收敛至全部要素范围。
 */
export function MapFitBounds({
	points,
	enabled = false,
	padding = 48,
	maxZoom = 13,
	duration = 600,
}: MapFitBoundsProps) {
	const { map, isLoaded } = useMap();
	const lastKeyRef = useRef<string | null>(null);

	useEffect(() => {
		if (!enabled || !isLoaded || !map) return;
		const bounds = computeBounds(points);
		if (!bounds) return;

		const boundsKey = `${bounds.west.toFixed(4)},${bounds.south.toFixed(4)},${bounds.east.toFixed(4)},${bounds.north.toFixed(4)},${points.length}`;
		if (lastKeyRef.current === boundsKey) return;
		lastKeyRef.current = boundsKey;

		if (bounds.isSinglePoint) {
			map.flyTo({
				center: bounds.center,
				zoom: Math.min(map.getZoom(), maxZoom),
				duration,
				essential: true,
			});
			return;
		}

		if (!bounds.spansAntimeridian && typeof map.fitBounds === "function") {
			map.fitBounds(
				[
					[bounds.west, bounds.south],
					[bounds.east, bounds.north],
				],
				{ padding, maxZoom, duration },
			);
		} else {
			map.flyTo({
				center: bounds.center,
				duration,
				essential: true,
			});
		}
	}, [enabled, isLoaded, map, points, padding, maxZoom, duration]);

	return null;
}
