"use client";

import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";

import type { BasemapPreset, BasemapStyleKey } from "../presets/basemaps";

import { BASEMAP_OPTIONS } from "../presets/basemaps";

export interface MapBasemapDropdownProps {
	basemap: BasemapPreset;
	onBasemapChange: (basemap: BasemapStyleKey) => void;
}

export function MapBasemapDropdown({ basemap, onBasemapChange }: MapBasemapDropdownProps) {
	const t = useTranslations("map");

	const activeOpt = BASEMAP_OPTIONS.find((b) => b.value === basemap);
	const activeBasemapLabel = activeOpt ? t(activeOpt.labelKey) : t("basemap_custom");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="text-muted-foreground hover:text-foreground"
					title={t("basemap_selector")}
					aria-label={t("basemap_selector")}
				>
					<Layers data-icon="inline-start" aria-hidden="true" />
					<span className="hidden md:inline">{activeBasemapLabel}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup>
					{BASEMAP_OPTIONS.map((opt) => {
						const itemLabel = t(opt.labelKey);
						const itemDesc = t(opt.descKey);

						return (
							<DropdownMenuItem
								key={opt.value}
								onClick={() => onBasemapChange(opt.value)}
								className={cn(
									"flex flex-col items-start gap-0.5 text-xs",
									basemap === opt.value && "font-semibold text-primary",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<span>{itemLabel}</span>
									{basemap === opt.value ? <span className="bg-primary size-1.5 rounded-full" /> : null}
								</div>
								{itemDesc ? <span className="text-muted-foreground text-[10px] font-normal">{itemDesc}</span> : null}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
