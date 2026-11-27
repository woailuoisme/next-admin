"use client";

import type { ArcFlightItem } from "./types";

export interface ArcDetailCardProps {
	arc: ArcFlightItem | null;
}

export function ArcDetailCard({ arc }: ArcDetailCardProps) {
	if (!arc) return null;

	const originLabel = arc.fromLabel ?? arc.fromName ?? `${arc.from[0].toFixed(2)}, ${arc.from[1].toFixed(2)}`;
	const destLabel = arc.toLabel ?? arc.toName ?? `${arc.to[0].toFixed(2)}, ${arc.to[1].toFixed(2)}`;
	const subtitle = arc.label ?? arc.category;

	return (
		<div
			role="status"
			aria-live="polite"
			className="border-border bg-card/90 pointer-events-none absolute top-3 left-3 z-10 rounded-lg border px-3 py-2 text-xs shadow-md backdrop-blur-md"
		>
			<div className="text-foreground flex items-center gap-1.5 font-medium">
				<span>{originLabel}</span>
				<span className="text-muted-foreground" aria-hidden="true">
					&rarr;
				</span>
				<span>{destLabel}</span>
			</div>
			{subtitle ? <div className="text-muted-foreground mt-0.5">{subtitle}</div> : null}
			{arc.value != null ? (
				<div className="text-primary mt-0.5 font-semibold tabular-nums">{arc.value.toLocaleString()}</div>
			) : null}
		</div>
	);
}
