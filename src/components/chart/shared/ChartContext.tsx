"use client";

import { createContext, memo, type ReactNode, useContext, useMemo } from "react";

import type { ChartHeight } from "./types";

export interface ChartContextValue {
	/** Container-provided height inherited from ChartCard or ChartFullscreenDialog */
	height?: ChartHeight;
	/** When true (fullscreen dialog), container height overrides explicit child height props */
	isFullscreen?: boolean;
}

const ChartContext = createContext<ChartContextValue>({});

export interface ChartProviderProps {
	height?: ChartHeight;
	isFullscreen?: boolean;
	children: ReactNode;
}

/**
 * Provides container height and fullscreen override state to descendant chart primitives.
 */
export const ChartProvider = memo(function ChartProvider({
	height,
	isFullscreen = false,
	children,
}: ChartProviderProps) {
	const value = useMemo(() => ({ height, isFullscreen }), [height, isFullscreen]);
	return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
});

/**
 * Resolves the effective chart height using fullscreen context > explicit prop > card context > default.
 */
export function useChartHeight(explicitHeight?: ChartHeight, defaultHeight = 300): ChartHeight {
	const ctx = useContext(ChartContext);
	if (ctx.isFullscreen && ctx.height !== undefined) {
		return ctx.height;
	}
	return explicitHeight ?? ctx.height ?? defaultHeight;
}
