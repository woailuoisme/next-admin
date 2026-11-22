"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { Section } from "@/components/shared/layout";
import { FormLocationPicker } from "@/components/form/map";
import type { BasemapPreset } from "@/components/map/presets/basemaps";
import type { CoordinateSystem } from "@/components/map/utils/coordinates";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { BASEMAP_SELECT_OPTIONS, COORDINATE_SYSTEM_OPTIONS, DEMO_CITY_PRESETS } from "../constants";

export interface GeospatialTabProps {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
	form: any;
}

export function GeospatialTab({ form }: GeospatialTabProps) {
	const t = useTranslations("showcase");
	const controlId = useId();
	// Geospatial configuration state for the interactive demo (self-contained)
	const [activeBasemap, setActiveBasemap] = useState<BasemapPreset>("amap");
	const [activeCRS, setActiveCRS] = useState<CoordinateSystem>("WGS84");
	const [showSearch, setShowSearch] = useState(true);
	const [showCoordsInput, setShowCoordsInput] = useState(true);
	const [isLocationDisabled, setIsLocationDisabled] = useState(false);

	return (
		<div className="space-y-6">
			<Section
				title="Interactive Map Location Picker (FormLocationPicker)"
				description="Full-featured geographic coordinate picker built on MapLibre GL with integrated reverse geocoding, address search, coordinate system transformation, and quick presets."
			>
				<div className="space-y-4">
					<FormLocationPicker
						form={form}
						name="officeLocation"
						label="Headquarters Campus (FormLocationPicker)"
						helperText="Interactive vector map with quick city preset chips, one-click coordinate copy, reverse geocoding on drag end, and TanStack Form state synchronization."
						required
						height={340}
						zoom={13}
						showAddressSearch
						showCoordinatesInput
						showCopyButton
						quickPresets={DEMO_CITY_PRESETS}
					/>
				</div>
			</Section>

			<Section
				title="Custom Basemaps, Projections & Multi-CRS Configuration"
				description="Switch between coordinate systems (WGS84, GCJ02, BD09), basemap providers (Amap, Carto, OpenStreetMap, Tianditu), and toggle manual controls dynamically."
			>
				<div className="space-y-4">
					<div className="border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-1.5">
								<span className="text-muted-foreground text-xs font-medium">{t("forms_geo_basemap_label")}</span>
								<div className="flex items-center gap-1">
									{BASEMAP_SELECT_OPTIONS.map((opt) => (
										<Button
											key={opt.value}
											type="button"
											size="xs"
											variant={activeBasemap === opt.value ? "default" : "outline"}
											onClick={() => setActiveBasemap(opt.value)}
										>
											{opt.label}
										</Button>
									))}
								</div>
							</div>

							<div className="flex items-center gap-1.5">
								<span className="text-muted-foreground text-xs font-medium">{t("forms_geo_crs_label")}</span>
								<div className="flex items-center gap-1">
									{COORDINATE_SYSTEM_OPTIONS.map((opt) => (
										<Button
											key={opt.value}
											type="button"
											size="xs"
											variant={activeCRS === opt.value ? "default" : "outline"}
											onClick={() => setActiveCRS(opt.value)}
										>
											{opt.label}
										</Button>
									))}
								</div>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-4 text-xs">
							<div className="flex items-center gap-1.5">
								<Checkbox
									id={`${controlId}-search`}
									checked={showSearch}
									onCheckedChange={(checked) => setShowSearch(Boolean(checked))}
								/>
								<Label
									htmlFor={`${controlId}-search`}
									className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-normal"
								>
									{t("forms_geo_search_toggle")}
								</Label>
							</div>
							<div className="flex items-center gap-1.5">
								<Checkbox
									id={`${controlId}-coords`}
									checked={showCoordsInput}
									onCheckedChange={(checked) => setShowCoordsInput(Boolean(checked))}
								/>
								<Label
									htmlFor={`${controlId}-coords`}
									className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-normal"
								>
									{t("forms_geo_coords_toggle")}
								</Label>
							</div>
							<div className="flex items-center gap-1.5">
								<Checkbox
									id={`${controlId}-disabled`}
									checked={isLocationDisabled}
									onCheckedChange={(checked) => setIsLocationDisabled(Boolean(checked))}
								/>
								<Label
									htmlFor={`${controlId}-disabled`}
									className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-normal"
								>
									{t("forms_geo_disabled_toggle")}
								</Label>
							</div>
						</div>
					</div>

					<FormLocationPicker
						form={form}
						name="warehouseLocation"
						label={`Regional Logistics Hub (Basemap: ${activeBasemap}, CRS: ${activeCRS})`}
						helperText="Dynamically updates basemap tiles and CRS math according to interactive controls above."
						basemap={activeBasemap}
						coordinateSystem={activeCRS}
						height={280}
						zoom={11}
						showAddressSearch={showSearch}
						showCoordinatesInput={showCoordsInput}
						disabled={isLocationDisabled}
						searchPlaceholder={t("forms_geo_search_placeholder")}
					/>
				</div>
			</Section>
		</div>
	);
}
