"use client";

import type * as MapLibreGL from "maplibre-gl";

import { useEffect } from "react";

import { useMap } from "@/components/ui/map";

export interface MapAutoResizerProps {
	/** Debounce delay in ms before triggering map.resize (default: 50) */
	debounceMs?: number;
}

const FALLBACK_EMPTY_IMAGE = {
	width: 1,
	height: 1,
	data: new Uint8Array([0, 0, 0, 0]),
};

/**
 * 为底图样式中缺失的 sprite 图标（例如 Carto Positron / Dark Matter 未打包的 `"circle-11"`）
 * 按需注册 1x1 透明占位图像，消除 MapLibre `Image "..." could not be loaded` 控制台告警。
 */
export function ensureFallbackStyleImage(map: MapLibreGL.Map, id: string): void {
	if (!id || typeof map.addImage !== "function") return;
	try {
		if (typeof map.hasImage === "function" && map.hasImage(id)) return;
		map.addImage(id, FALLBACK_EMPTY_IMAGE);
	} catch {
		// 忽略并发或样式切换期间的重复注册异常
	}
}

/**
 * 监听地图容器尺寸变化（侧栏折叠、全屏 Portal 切换、Tabs 切换、页面重显）并自动触发 map.resize()；
 * 同时统一托管缺失 Sprite 图标的兜底解析器（覆盖 MapFrame 与 LocationPicker）。
 */
export function MapAutoResizer({ debounceMs = 50 }: MapAutoResizerProps) {
	const { map, isLoaded } = useMap();

	useEffect(() => {
		if (!map) return;

		const handleMissingImage = (id: string) => {
			ensureFallbackStyleImage(map, id);
		};
		const handleStyleImageMissingEvent = (event: { id?: string }) => {
			if (event?.id) {
				ensureFallbackStyleImage(map, event.id);
			}
		};

		if (typeof map.setMissingStyleImageResolver === "function") {
			map.setMissingStyleImageResolver(handleMissingImage);
		}
		map.on?.("styleimagemissing", handleStyleImageMissingEvent);

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const handleResize = () => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				if (map && typeof map.resize === "function") {
					map.resize();
				}
			}, debounceMs);
		};

		let observer: ResizeObserver | null = null;
		const container = map.getContainer?.();
		if (container && typeof ResizeObserver !== "undefined") {
			observer = new ResizeObserver(() => {
				handleResize();
			});
			observer.observe(container);
		}

		window.addEventListener("resize", handleResize, { passive: true });

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				handleResize();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			if (typeof map.setMissingStyleImageResolver === "function") {
				map.setMissingStyleImageResolver(null);
			}
			map.off?.("styleimagemissing", handleStyleImageMissingEvent);
			if (timeoutId) clearTimeout(timeoutId);
			if (observer && container) {
				observer.unobserve(container);
				observer.disconnect();
			}
			window.removeEventListener("resize", handleResize);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [map, debounceMs]);

	useEffect(() => {
		if (map && isLoaded && typeof map.resize === "function") {
			map.resize();
		}
	}, [map, isLoaded]);

	return null;
}
