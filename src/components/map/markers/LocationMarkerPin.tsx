"use client";

import { MapPin } from "lucide-react";

import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "cn";

import type { LocationMarkerItem } from "./types";

import { LocationMarkerPopup } from "./LocationMarkerPopup";

interface LocationMarkerPinProps {
	item: LocationMarkerItem;
	isSelected: boolean;
	onSelect: (item: LocationMarkerItem) => void;
	renderPopup?: (item: LocationMarkerItem) => React.ReactNode;
}

export function LocationMarkerPin({ item, isSelected, onSelect, renderPopup }: LocationMarkerPinProps) {
	const pinColor = item.color || "var(--primary)";
	const handleSelect = () => {
		onSelect(item);
	};

	return (
		<MapMarker longitude={item.coordinates[0]} latitude={item.coordinates[1]} onClick={handleSelect}>
			<MarkerContent>
				<button
					type="button"
					aria-label={item.address ? `${item.title} - ${item.address}` : item.title}
					aria-pressed={isSelected}
					className={cn(
						"group relative flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
						isSelected ? "z-30 scale-125" : "z-10 hover:scale-110",
					)}
				>
					{isSelected ? (
						<span
							aria-hidden="true"
							className="absolute size-8 animate-ping rounded-full opacity-40 motion-reduce:animate-none"
							style={{ backgroundColor: pinColor }}
						/>
					) : null}

					<span
						className="border-background flex size-7 items-center justify-center rounded-full border-2 shadow-md"
						style={{ backgroundColor: pinColor }}
					>
						<MapPin className="text-primary-foreground size-3.5 stroke-[2.5]" aria-hidden="true" />
					</span>

					<span
						className={cn(
							"pointer-events-none absolute top-8 rounded-md border border-border/80 bg-background/95 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground shadow-sm backdrop-blur-xs transition-opacity",
							isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
						)}
					>
						{item.title}
					</span>
				</button>
			</MarkerContent>

			<MarkerPopup className="max-w-72">
				{renderPopup ? renderPopup(item) : <LocationMarkerPopup item={item} />}
			</MarkerPopup>
		</MapMarker>
	);
}
