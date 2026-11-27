"use client";

import { useTranslations } from "next-intl";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";

import type { ArcNodePoint } from "./useArcTopology";

export interface ArcNodeMarkerProps {
	node: ArcNodePoint;
	size?: number;
	arcColor: string;
}

export function ArcNodeMarker({ node, size = 10, arcColor }: ArcNodeMarkerProps) {
	const t = useTranslations("map");
	const ariaLabel = node.label
		? `${node.label} (${t("arc_node_routes", { count: node.count })})`
		: t("arc_node_routes", { count: node.count });

	return (
		<MapMarker longitude={node.lngLat[0]} latitude={node.lngLat[1]}>
			<MarkerContent>
				<button
					type="button"
					aria-label={ariaLabel}
					className="focus-visible:ring-ring relative flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2"
					style={{ width: size + 8, height: size + 8 }}
				>
					<span
						aria-hidden="true"
						className="absolute inset-0 animate-ping rounded-full opacity-35 motion-reduce:animate-none"
						style={{ backgroundColor: arcColor }}
					/>
					<span
						className="border-background relative rounded-full border shadow-sm"
						style={{
							width: size,
							height: size,
							backgroundColor: arcColor,
						}}
					/>
				</button>
			</MarkerContent>
			{node.label ? (
				<MarkerTooltip>
					<div className="text-xs font-medium">{node.label}</div>
					<div className="text-muted-foreground text-[11px]">{t("arc_node_routes", { count: node.count })}</div>
				</MarkerTooltip>
			) : null}
		</MapMarker>
	);
}
