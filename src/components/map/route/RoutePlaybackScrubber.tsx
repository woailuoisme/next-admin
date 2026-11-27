"use client";

import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import type { RouteProgressStore } from "./useRouteTracking";
import type { VehicleInfo } from "./types";

interface RoutePlaybackScrubberProps {
	isPlaying: boolean;
	progressStore: RouteProgressStore;
	onTogglePlay: () => void;
	onReset: () => void;
	onSeek: (value: number) => void;
	vehicle?: VehicleInfo;
}

export function RoutePlaybackScrubber({
	isPlaying,
	progressStore,
	onTogglePlay,
	onReset,
	onSeek,
	vehicle,
}: RoutePlaybackScrubberProps) {
	const t = useTranslations("map");
	const progress = useSyncExternalStore(
		progressStore.subscribe,
		progressStore.getSnapshot,
		progressStore.getServerSnapshot,
	);

	const playLabel = isPlaying ? t("route_pause") : t("route_play");
	const resetLabel = t("route_reset");
	const pct = Math.round(progress * 100);

	return (
		<div className="border-border/80 bg-background/90 absolute right-14 bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border px-3.5 py-2.5 shadow-lg backdrop-blur-md">
			<Button
				variant="ghost"
				size="icon"
				className="text-primary shrink-0"
				onClick={onTogglePlay}
				title={playLabel}
				aria-label={playLabel}
			>
				{isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
			</Button>

			<Button
				variant="ghost"
				size="icon"
				className="text-muted-foreground hover:text-foreground shrink-0"
				onClick={onReset}
				title={resetLabel}
				aria-label={resetLabel}
			>
				<RotateCcw aria-hidden="true" />
			</Button>

			<div className="flex flex-1 items-center gap-3">
				<Slider
					value={[pct]}
					min={0}
					max={100}
					step={1}
					onValueChange={(val) => onSeek(val[0] / 100)}
					className="w-full cursor-pointer"
					aria-label={t("route_progress_aria")}
				/>
				<span className="text-muted-foreground w-10 text-right font-mono text-xs font-semibold">{pct}%</span>
			</div>

			{vehicle?.speed !== undefined ? (
				<div className="hidden items-center gap-1 sm:flex">
					<Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px]">
						{vehicle.speed} km/h
					</Badge>
				</div>
			) : null}
		</div>
	);
}
