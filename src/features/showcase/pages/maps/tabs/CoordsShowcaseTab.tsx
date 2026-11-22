"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LazyLocationMarkerMap } from "@/components/map/lazy";
import { BASEMAP_OPTIONS, type BasemapStyleKey } from "@/components/map/presets/basemaps";
import type { CoordinateSystem } from "@/components/map/utils/coordinates";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_LOCATIONS } from "../constants";

const COORD_SYSTEMS: readonly CoordinateSystem[] = ["WGS84", "GCJ02", "BD09"] as const;

export function CoordsShowcaseTab() {
	const t = useTranslations("showcase");
	const tMap = useTranslations("map");
	const [activeBasemap, setActiveBasemap] = useState<BasemapStyleKey>("carto");
	const [activeCoordSys, setActiveCoordSys] = useState<CoordinateSystem>("WGS84");

	return (
		<TabsContent value="coords" className="space-y-4">
			<div className="border-border/70 bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-xs md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<div className="text-foreground text-xs font-semibold">{t("maps_coords_title")}</div>
					<div className="text-muted-foreground text-[11px]">{t("maps_coords_desc")}</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-1 text-xs">
						<span className="text-muted-foreground">{t("maps_coords_crs_label")}</span>
						<div className="border-border flex rounded-md border p-0.5">
							{COORD_SYSTEMS.map((cs) => (
								<Button
									key={cs}
									variant={activeCoordSys === cs ? "default" : "ghost"}
									size="xs"
									className="h-6 px-2 text-[10px]"
									onClick={() => setActiveCoordSys(cs)}
								>
									{cs}
								</Button>
							))}
						</div>
					</div>

					<div className="flex items-center gap-1 text-xs">
						<span className="text-muted-foreground">{t("maps_coords_basemap_label")}</span>
						<div className="border-border flex rounded-md border p-0.5">
							{BASEMAP_OPTIONS.map((bm) => (
								<Button
									key={bm.value}
									variant={activeBasemap === bm.value ? "default" : "ghost"}
									size="xs"
									className="h-6 px-2 text-[10px]"
									onClick={() => setActiveBasemap(bm.value)}
								>
									{tMap(bm.labelKey)}
								</Button>
							))}
						</div>
					</div>
				</div>
			</div>

			<LazyLocationMarkerMap
				locations={MOCK_LOCATIONS}
				coordinateSystem={activeCoordSys}
				basemap={activeBasemap}
				height={500}
				center={[116.4, 39.9]}
				zoom={10}
				showSearch={true}
				showSidebarList={false}
				cardProps={{
					title: t("maps_coords_card_title", { crs: activeCoordSys, basemap: activeBasemap }),
					description: t("maps_coords_card_desc"),
				}}
			/>
		</TabsContent>
	);
}
