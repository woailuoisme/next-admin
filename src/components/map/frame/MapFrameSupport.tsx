"use client";

import { useMemoizedFn } from "ahooks";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useMap } from "@/components/ui/map";

import type { BasemapPreset, BasemapStyleKey } from "../presets/basemaps";

export function useMapBasemapState(
	controlledBasemap: BasemapPreset = "carto",
	onBasemapChange?: (basemap: BasemapPreset) => void,
) {
	const [internalBasemap, setInternalBasemap] = useState<BasemapPreset>(controlledBasemap);
	const [lastPropBasemap, setLastPropBasemap] = useState<BasemapPreset>(controlledBasemap);

	if (controlledBasemap !== lastPropBasemap) {
		setLastPropBasemap(controlledBasemap);
		setInternalBasemap(controlledBasemap);
	}

	const activeBasemap = onBasemapChange ? controlledBasemap : internalBasemap;

	const handleBasemapChange = useMemoizedFn((next: BasemapStyleKey | BasemapPreset) => {
		if (!onBasemapChange) {
			setInternalBasemap(next);
		}
		onBasemapChange?.(next);
	});

	return { activeBasemap, handleBasemapChange };
}

export const MapRuntimeWatcher = memo(function MapRuntimeWatcher({
	onRuntimeError,
}: {
	onRuntimeError: (message: string) => void;
}) {
	const { map } = useMap();

	useEffect(() => {
		if (!map) return;

		const handleError = (event: { error?: { message?: string; status?: number } }) => {
			const msg = event?.error?.message;
			const status = event?.error?.status;
			if (status === 401 || status === 403 || status === 404 || msg) {
				onRuntimeError(msg || `HTTP ${status}`);
			}
		};

		map.on("error", handleError);
		return () => {
			map.off("error", handleError);
		};
	}, [map, onRuntimeError]);

	return null;
});

export function MapTileWarningBanner({ onRetry, onDismiss }: { onRetry: () => void; onDismiss: () => void }) {
	const t = useTranslations("map");

	return (
		<div
			role="status"
			className="border-destructive/30 bg-background/95 text-foreground absolute bottom-3 left-3 z-20 flex max-w-sm items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs shadow-md backdrop-blur-md"
		>
			<AlertTriangle className="text-destructive size-3.5 shrink-0" aria-hidden="true" />
			<span className="line-clamp-1 flex-1">{t("error_tile_timeout")}</span>
			<Button type="button" variant="ghost" size="sm" onClick={onRetry} className="h-6 px-1.5 text-[11px]">
				<RefreshCw className="mr-1 size-3" aria-hidden="true" />
				{t("retry")}
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={onDismiss}
				aria-label={t("dismiss_notice")}
				className="size-5"
			>
				<X className="size-3" aria-hidden="true" />
			</Button>
		</div>
	);
}
