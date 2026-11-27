"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { LiveStatus } from "@/components/stats/live-card/types";

import { useDemoTelemetryTicker } from "../hooks/useDemoTelemetryTicker";

export interface DemoTelemetryData {
	value: number;
	sparklineData: number[];
	status: LiveStatus;
	lastUpdated: string;
}

export interface DemoTelemetryControls {
	isRunning: boolean;
	toggle: () => void;
	start: () => void;
	stop: () => void;
	tick: () => void;
}

const DemoTelemetryDataContext = createContext<DemoTelemetryData | null>(null);
const DemoTelemetryControlsContext = createContext<DemoTelemetryControls | null>(null);

/**
 * Isolates 2.5s tick updates into leaf LiveStatCard consumers so surrounding
 * Showcase tabs and Recharts containers never re-render on telemetry ticks.
 */
export function DemoTelemetryProvider({ children }: { children: ReactNode }) {
	const ticker = useDemoTelemetryTicker({
		initialValue: 1420,
		intervalMs: 2500,
		bufferSize: 12,
		min: 1200,
		max: 1800,
		volatility: 0.04,
	});

	// Whitelist AGENTS.md §5.2: 隔离 2.5s 高频遥测数据更新与控制引用，避免外层 Tabs 与图表重渲染
	const dataValue = useMemo<DemoTelemetryData>(
		() => ({
			value: ticker.value,
			sparklineData: ticker.sparklineData,
			status: ticker.status,
			lastUpdated: ticker.lastUpdated,
		}),
		[ticker.value, ticker.sparklineData, ticker.status, ticker.lastUpdated],
	);

	// Whitelist AGENTS.md §5.2: 与 dataValue 拆分为独立 Context，避免控制栏消费端随高频数据流重渲染
	const controlsValue = useMemo<DemoTelemetryControls>(
		() => ({
			isRunning: ticker.isRunning,
			toggle: ticker.toggle,
			start: ticker.start,
			stop: ticker.stop,
			tick: ticker.tick,
		}),
		[ticker.isRunning, ticker.toggle, ticker.start, ticker.stop, ticker.tick],
	);

	return (
		<DemoTelemetryControlsContext value={controlsValue}>
			<DemoTelemetryDataContext value={dataValue}>{children}</DemoTelemetryDataContext>
		</DemoTelemetryControlsContext>
	);
}

export function useDemoTelemetryData(): DemoTelemetryData {
	const ctx = useContext(DemoTelemetryDataContext);
	if (!ctx) {
		throw new Error("useDemoTelemetryData must be used inside DemoTelemetryProvider");
	}
	return ctx;
}

export function useDemoTelemetryControls(): DemoTelemetryControls {
	const ctx = useContext(DemoTelemetryControlsContext);
	if (!ctx) {
		throw new Error("useDemoTelemetryControls must be used inside DemoTelemetryProvider");
	}
	return ctx;
}
