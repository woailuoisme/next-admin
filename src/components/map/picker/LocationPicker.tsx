"use client";

import { useTranslations } from "next-intl";
import { LocateFixed, MapPin } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "cn";

import type { LocationPickerProps } from "./types";

import { MAP_ATTRIBUTION_PROPS } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapFlyTo } from "../shared/MapFlyTo";
import { LocationAddressSearch } from "./LocationAddressSearch";
import { LocationCoordinatesInput } from "./LocationCoordinatesInput";
import { MapClickHandler } from "./MapClickHandler";
import { useLocationPicker } from "./useLocationPicker";

export const LocationPicker = memo(function LocationPicker({
	coordinateSystem = "WGS84",
	value,
	defaultValue,
	onChange,
	disabled = false,
	readOnly = false,
	showCoordinatesInput = true,
	showAddressSearch = true,
	showReset = true,
	searchPlaceholder,
	height = 320,
	center,
	zoom = 12,
	basemap = "amap",
	customStyleUrl,
	className,
	externalInteractionEpoch = 0,
}: LocationPickerProps) {
	const t = useTranslations("map");
	const {
		basemapConfig,
		mapCenter,
		flyToTarget,
		displayPosition,
		currentValue,
		hasValidCurrentValue,
		effectiveAddress,
		isPickerBlocked,
		handleMapPick,
		handleMarkerDragEnd,
		handlePlaceSelect,
		handleCoordinatesChange,
		handleCoordinatesConfirm,
		handleLocate,
		handleReset,
	} = useLocationPicker({
		coordinateSystem,
		value,
		defaultValue,
		onChange,
		disabled,
		readOnly,
		center,
		basemap,
		customStyleUrl,
		externalInteractionEpoch,
	});

	const markerAriaLabel = effectiveAddress
		? `${t("picker_selected_location")}: ${effectiveAddress}`
		: t("picker_selected_location");

	return (
		<div className={cn("flex flex-col gap-2.5 select-none", className)}>
			{showAddressSearch ? (
				<LocationAddressSearch
					disabled={disabled}
					readOnly={readOnly}
					placeholder={searchPlaceholder}
					onSelect={handlePlaceSelect}
				/>
			) : null}

			<div
				className={cn(
					"relative w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs",
					disabled && "pointer-events-none opacity-60",
				)}
				style={{ height }}
			>
				<Map
					center={mapCenter}
					zoom={zoom}
					{...MAP_ATTRIBUTION_PROPS}
					styles={basemapConfig.styles}
					blank={basemapConfig.blank}
					interactive={!disabled}
					className="size-full"
				>
					<MapAutoResizer />
					<MapFlyTo target={flyToTarget ?? null} />
					<MapControls position="bottom-right" showZoom showCompass showLocate onLocate={handleLocate} />
					<MapClickHandler onClick={handleMapPick} disabled={isPickerBlocked} />

					{displayPosition ? (
						<MapMarker
							longitude={displayPosition[0]}
							latitude={displayPosition[1]}
							draggable={!isPickerBlocked}
							onDragEnd={handleMarkerDragEnd}
						>
							<MarkerContent>
								<button
									type="button"
									aria-label={markerAriaLabel}
									className="group focus-visible:ring-ring relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2"
								>
									<span
										aria-hidden="true"
										className="bg-primary/20 absolute -inset-2.5 animate-ping rounded-full motion-reduce:animate-none"
									/>
									<span className="border-background bg-primary text-primary-foreground relative flex size-8 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110 active:scale-95">
										<MapPin className="size-4" aria-hidden="true" />
									</span>
								</button>
							</MarkerContent>
							<MarkerPopup className="w-56 p-2.5">
								<div className="space-y-1 text-xs">
									<p className="text-foreground font-semibold">{t("picker_selected_location")}</p>
									{effectiveAddress ? <p className="text-muted-foreground leading-tight">{effectiveAddress}</p> : null}
									<p className="text-muted-foreground font-mono text-[11px]">
										{currentValue?.lng.toFixed(5)}, {currentValue?.lat.toFixed(5)}
									</p>
								</div>
							</MarkerPopup>
						</MapMarker>
					) : null}
				</Map>

				{hasValidCurrentValue || isPickerBlocked ? (
					<div className="border-border/80 bg-background/90 pointer-events-none absolute top-3 left-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-md border px-2.5 py-1 text-xs shadow-xs backdrop-blur-md">
						<LocateFixed className="text-primary size-3.5 shrink-0" aria-hidden="true" />
						{isPickerBlocked ? <span className="text-muted-foreground shrink-0">{t("picker_view_only")}</span> : null}
						{effectiveAddress ? <span className="text-foreground/80 min-w-0 truncate">{effectiveAddress}</span> : null}
						{hasValidCurrentValue && currentValue ? (
							<Badge variant="outline" className="shrink-0 font-mono text-[11px]">
								{currentValue.lng.toFixed(4)}, {currentValue.lat.toFixed(4)}
							</Badge>
						) : null}
					</div>
				) : null}
			</div>

			{showCoordinatesInput ? (
				<LocationCoordinatesInput
					value={hasValidCurrentValue ? currentValue : undefined}
					disabled={disabled}
					readOnly={readOnly}
					showReset={showReset}
					onCoordinatesChange={handleCoordinatesChange}
					onConfirm={handleCoordinatesConfirm}
					onReset={handleReset}
				/>
			) : null}
		</div>
	);
});
