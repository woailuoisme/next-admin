"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "cn";

import type { AmapPlace } from "./amapGeo";

interface LocationSearchDropdownProps {
	listboxId: string;
	places: AmapPlace[];
	activeIndex: number;
	error?: string;
	showEmptyNotice: boolean;
	onHighlight: (index: number) => void;
	onSelect: (place: AmapPlace) => void;
}

export function LocationSearchDropdown({
	listboxId,
	places,
	activeIndex,
	error,
	showEmptyNotice,
	onHighlight,
	onSelect,
}: LocationSearchDropdownProps) {
	const t = useTranslations("map");

	return (
		<div
			id={listboxId}
			role="listbox"
			aria-label={t("picker_search_aria")}
			className="border-border/80 bg-popover absolute top-full left-0 z-30 mt-1 max-h-56 w-full min-w-64 overflow-y-auto rounded-md border p-1 shadow-md"
		>
			{error ? <p className="text-destructive px-2 py-1.5 text-[11px] leading-snug">{error}</p> : null}
			{showEmptyNotice ? (
				<p className="text-muted-foreground px-2 py-2 text-center text-xs">{t("picker_search_empty")}</p>
			) : null}
			{places.map((place, index) => {
				const isSelected = activeIndex === index;
				return (
					<button
						key={place.id}
						id={`${listboxId}-opt-${index}`}
						type="button"
						role="option"
						aria-selected={isSelected}
						onMouseEnter={() => onHighlight(index)}
						onClick={() => onSelect(place)}
						className={cn(
							"flex w-full cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
							isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
						)}
					>
						<MapPin aria-hidden="true" className="text-primary mt-0.5 size-3.5 shrink-0" />
						<span className="min-w-0 flex-1">
							<span className="text-foreground block truncate font-medium">{place.name}</span>
							{place.address ? (
								<span className="text-muted-foreground block truncate text-[11px]">{place.address}</span>
							) : null}
						</span>
					</button>
				);
			})}
		</div>
	);
}
