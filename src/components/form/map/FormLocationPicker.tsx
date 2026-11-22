"use client";

import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { LocationPickerValue } from "@/components/map/picker/types";
import type { BasemapPreset } from "@/components/map/presets/basemaps";
import { type CoordinateSystem, transformCoordinates } from "@/components/map/utils/coordinates";

import { LocationPicker } from "@/components/map/picker/LocationPicker";
import { type ConnectedFieldProps, connectField, type FormFieldRenderProps } from "../core";

export interface FormLocationPickerExtraProps {
	/** Input and output coordinate system: WGS84, GCJ02, BD09 (default: WGS84) */
	coordinateSystem?: CoordinateSystem;

	/** Map viewport height (default: 320) */
	height?: number | string;
	/** Viewport zoom (default: 12) */
	zoom?: number;
	/** Basemap preset (default: "carto") */
	basemap?: BasemapPreset;

	/** Whether to show manual numeric lng/lat inputs below the map (default: true) */
	showCoordinatesInput?: boolean;
	/** Whether to show clear/reset button (default: true) */
	showReset?: boolean;

	/** Whether to show quick address search bar (default: true) */
	showAddressSearch?: boolean;
	/** Search input placeholder */
	searchPlaceholder?: string;

	/** Whether to show quick one-click coordinate copy button (default: true) */
	showCopyButton?: boolean;

	/** Optional quick location presets rendered above the map */
	quickPresets?: Array<{ label: string; coords: { lng: number; lat: number } }>;
}

export type FormLocationPickerProps = ConnectedFieldProps<LocationPickerValue> & FormLocationPickerExtraProps;

const EMPTY_PRESETS: Array<{ label: string; coords: { lng: number; lat: number } }> = [];

function FormLocationControl({
	id,
	value,
	onChange,
	onBlur,
	disabled: isDisabled,
	readOnly: isReadOnly,
	hasError,
	describedBy,
	showAddressSearch = true,
	showCopyButton = true,
	quickPresets = EMPTY_PRESETS,
	...restPickerProps
}: FormFieldRenderProps<LocationPickerValue> & FormLocationPickerExtraProps) {
	const t = useTranslations("form");
	const [copied, setCopied] = useState(false);
	const [presetInteractionEpoch, setPresetInteractionEpoch] = useState(0);
	const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
		};
	}, []);

	const handleCopy = async (coords?: LocationPickerValue) => {
		if (
			!coords ||
			!Number.isFinite(coords.lng) ||
			!Number.isFinite(coords.lat) ||
			typeof navigator === "undefined" ||
			!navigator.clipboard
		) {
			toast.error(t("location_copy_failed"));
			return;
		}
		const text = `${coords.lng.toFixed(6)}, ${coords.lat.toFixed(6)}`;
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
			copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
		} catch {
			toast.error(t("location_copy_failed"));
		}
	};

	const targetCRS: CoordinateSystem = restPickerProps.coordinateSystem ?? "WGS84";
	const handlePresetSelect = (presetCoords: { lng: number; lat: number }) => {
		if (isDisabled || isReadOnly) return;
		const [convertedLng, convertedLat] = transformCoordinates([presetCoords.lng, presetCoords.lat], "WGS84", targetCRS);
		const updated: LocationPickerValue = {
			lng: Number(convertedLng.toFixed(6)),
			lat: Number(convertedLat.toFixed(6)),
			address: undefined,
		};
		setPresetInteractionEpoch((epoch) => epoch + 1);
		onChange(updated);
		onBlur?.();
	};

	return (
		<div
			id={id}
			aria-describedby={describedBy}
			data-invalid={hasError || undefined}
			className={hasError ? "ring-destructive/40 flex flex-col gap-2 rounded-lg p-1 ring-1" : "flex flex-col gap-2"}
		>
			{(quickPresets.length > 0 || (showCopyButton && value)) && (
				<div className="flex flex-wrap items-center justify-between gap-2">
					{quickPresets.length > 0 ? (
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="text-muted-foreground text-[11px] font-medium">{t("location_presets")}</span>
							{quickPresets.map((preset) => (
								<Button
									key={preset.label}
									type="button"
									variant="outline"
									size="xs"
									disabled={isDisabled || isReadOnly}
									onClick={() => handlePresetSelect(preset.coords)}
									className="border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary h-6 px-2 text-[11px]"
								>
									{preset.label}
								</Button>
							))}
						</div>
					) : (
						<div />
					)}

					{showCopyButton && value && (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							className="text-muted-foreground hover:text-foreground h-6 text-[11px]"
							onClick={() => handleCopy(value)}
							title={t("location_copy_title")}
						>
							{copied ? (
								<>
									<Check aria-hidden="true" className="text-primary size-3" />
									<span className="text-primary font-medium">{t("location_copied")}</span>
								</>
							) : (
								<>
									<Copy aria-hidden="true" className="size-3" />
									<span>{t("location_copy_coords")}</span>
								</>
							)}
						</Button>
					)}
				</div>
			)}

			<LocationPicker
				{...restPickerProps}
				externalInteractionEpoch={presetInteractionEpoch}
				showAddressSearch={showAddressSearch}
				value={value}
				onChange={(val) => {
					onChange(val);
					onBlur?.();
				}}
				disabled={isDisabled}
				readOnly={isReadOnly}
			/>
		</div>
	);
}

export const FormLocationPicker = connectField<LocationPickerValue, FormLocationPickerExtraProps>(FormLocationControl);
