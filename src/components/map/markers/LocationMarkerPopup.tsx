"use client";

import { Building2, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { LocationMarkerItem } from "./types";

interface LocationMarkerPopupProps {
	item: LocationMarkerItem;
}

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
	active: "default",
	warning: "secondary",
	inactive: "outline",
};

function formatExtraEntries(extra?: Record<string, unknown>): Array<[string, string]> {
	if (!extra) return [];
	const entries: Array<[string, string]> = [];
	for (const [k, v] of Object.entries(extra)) {
		if (v === null || v === undefined || typeof v === "object") continue;
		entries.push([k, String(v)]);
		if (entries.length >= 3) break;
	}
	return entries;
}

export function LocationMarkerPopup({ item }: LocationMarkerPopupProps) {
	const extraEntries = formatExtraEntries(item.extra);

	return (
		<div className="flex w-64 flex-col gap-2.5 p-1 text-xs">
			<div className="flex items-start justify-between gap-2">
				<div className="text-foreground text-sm leading-tight font-semibold">{item.title}</div>
				<div className="flex shrink-0 items-center gap-1">
					{item.badge ? (
						<Badge variant="outline" className="px-1.5 py-0 text-[10px]">
							{item.badge}
						</Badge>
					) : null}
					{item.status ? (
						<Badge variant={STATUS_BADGE_VARIANTS[item.status] ?? "outline"} className="text-[10px]">
							{item.status}
						</Badge>
					) : null}
				</div>
			</div>

			{item.address ? (
				<div className="text-muted-foreground flex items-start gap-1.5">
					<Building2 className="mt-0.5 size-3.5 shrink-0" />
					<span className="leading-tight">{item.address}</span>
				</div>
			) : null}

			{item.phone ? (
				<div className="text-muted-foreground flex items-center gap-1.5">
					<Phone className="size-3.5 shrink-0" />
					<span>{item.phone}</span>
				</div>
			) : null}

			{item.description ? (
				<p className="border-border/40 text-muted-foreground/90 border-t pt-1.5 text-[11px]">{item.description}</p>
			) : null}

			{extraEntries.length > 0 ? (
				<div className="border-border/40 grid grid-cols-2 gap-x-2 gap-y-1 border-t pt-1.5 text-[11px]">
					{extraEntries.map(([k, v]) => (
						<div key={k} className="truncate">
							<span className="text-muted-foreground">{k}: </span>
							<span className="text-foreground font-medium">{v}</span>
						</div>
					))}
				</div>
			) : null}

			<div className="border-border/50 text-muted-foreground flex items-center justify-between gap-2 border-t pt-1.5 font-mono text-[10px]">
				<span>
					{item.coordinates[0].toFixed(4)}, {item.coordinates[1].toFixed(4)}
				</span>
				{item.category ? (
					<Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary px-1.5 py-0 text-[10px]">
						{item.category}
					</Badge>
				) : null}
			</div>
		</div>
	);
}
