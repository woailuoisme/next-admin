"use client";

import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { DEMO_STATES } from "../constants";
import { useDemoTelemetryControls } from "../context/DemoTelemetryContext";
import type { DemoState } from "../types";

export interface StatsHeaderBarProps {
	demoState: DemoState;
	onDemoStateChange: (st: DemoState) => void;
}

export function StatsHeaderBar({ demoState, onDemoStateChange }: StatsHeaderBarProps) {
	const { isRunning, tick, toggle } = useDemoTelemetryControls();

	return (
		<div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
			<div>
				<div className="flex items-center gap-2">
					<h1 className="text-foreground text-2xl font-bold tracking-tight">Enterprise Stats & Visualizations</h1>
					<Badge variant="secondary" className="font-mono text-xs">
						v2.0 Toolkit
					</Badge>
				</div>
				<p className="text-muted-foreground mt-1 text-sm">
					High-performance, composable statistics cards, real-time gauges, and Recharts widgets.
				</p>
			</div>

			{/* Global Demo Controls */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
					{DEMO_STATES.map((st) => (
						<Button
							key={st}
							type="button"
							size="xs"
							variant={demoState === st ? "secondary" : "ghost"}
							aria-pressed={demoState === st}
							className="capitalize"
							onClick={() => onDemoStateChange(st)}
						>
							{st}
						</Button>
					))}
				</div>
				<Button type="button" variant="outline" size="sm" className="text-xs" onClick={tick}>
					<RefreshCw data-icon="inline-start" aria-hidden="true" />
					Pulse Step
				</Button>
				<Button
					type="button"
					variant={isRunning ? "secondary" : "default"}
					size="sm"
					className="font-mono text-xs"
					onClick={toggle}
				>
					{isRunning ? "Pause Stream" : "Resume Stream"}
				</Button>
			</div>
		</div>
	);
}
