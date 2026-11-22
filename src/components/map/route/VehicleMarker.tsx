"use client";

import { useTranslations } from "next-intl";
import { Navigation, Truck } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { MarkerContent, MarkerPopup, RouteMarker } from "@/components/ui/map";

import type { VehicleInfo } from "./types";

interface VehicleMarkerProps {
	vehicle?: VehicleInfo;
	progress: number;
}

export const VehicleMarker = memo(function VehicleMarker({ vehicle, progress }: VehicleMarkerProps) {
	const t = useTranslations("map");

	return (
		<RouteMarker at="progress">
			<MarkerContent>
				<div
					role="img"
					className="relative flex items-center justify-center"
					aria-label={vehicle?.name || t("route_vehicle_default")}
				>
					<span
						aria-hidden="true"
						className="bg-primary/30 absolute -inset-2.5 animate-ping rounded-full motion-reduce:animate-none"
					/>
					<div className="border-background bg-primary text-primary-foreground relative flex size-8 items-center justify-center overflow-hidden rounded-full border-2 shadow-lg">
						{vehicle?.avatarUrl ? (
							<img src={vehicle.avatarUrl} alt={vehicle.name} className="size-full object-cover" />
						) : (
							<Navigation className="size-4 rotate-45" aria-hidden="true" />
						)}
					</div>
				</div>
			</MarkerContent>
			<MarkerPopup className="w-56 p-3">
				<div className="flex items-center gap-2">
					<div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full">
						{vehicle?.avatarUrl ? (
							<img src={vehicle.avatarUrl} alt={vehicle.name} className="size-full object-cover" />
						) : (
							<Truck className="size-4" aria-hidden="true" />
						)}
					</div>
					<div className="min-w-0 flex-1">
						<h4 className="truncate text-sm leading-tight font-semibold">
							{vehicle?.name || t("route_vehicle_default")}
						</h4>
						{vehicle?.licensePlate ? (
							<p className="text-muted-foreground truncate text-xs">{vehicle.licensePlate}</p>
						) : null}
					</div>
					{vehicle?.statusText ? (
						<Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
							{vehicle.statusText}
						</Badge>
					) : null}
				</div>
				<div className="border-border mt-2.5 flex items-center justify-between border-t pt-2 text-xs">
					<span className="text-muted-foreground">{t("route_vehicle_speed")}</span>
					<span className="text-primary font-semibold">{vehicle?.speed ?? 60} km/h</span>
				</div>
				<div className="mt-1 flex items-center justify-between text-xs">
					<span className="text-muted-foreground">{t("route_vehicle_progress")}</span>
					<span className="font-semibold">{Math.round(progress * 100)}%</span>
				</div>
			</MarkerPopup>
		</RouteMarker>
	);
});
