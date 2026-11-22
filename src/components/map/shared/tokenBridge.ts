"use client";

import { useSyncExternalStore } from "react";

import { buildRampFromBase, clearColorNormalizationCache, resolveCssColorToHex } from "./colorConversion";

export { resolveCssColorToHex };

export interface MapThemeTokens {
  primary: string;
  primarySoft: string;
  primaryForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  background: string;
  foreground: string;
  destructive: string;
  chartColors: readonly [string, string, string, string, string];
  primaryRamp: readonly string[];
  clusterColors: [string, string, string];
  isDark: boolean;
}

const FALLBACK_LIGHT_TOKENS: MapThemeTokens = {
  primary: "#bb4d00",
  primarySoft: "#f8a87d",
  primaryForeground: "#ffffff",
  border: "#e5e5e5",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  background: "#ffffff",
  foreground: "#171717",
  destructive: "#dc2626",
  chartColors: ["#f59e0b", "#10b981", "#ea580c", "#bb4d00", "#8b5cf6"],
  primaryRamp: ["#ffecde", "#ffd1b6", "#f8a87d", "#de793e", "#bb4d00"],
  clusterColors: ["#f8a87d", "#de793e", "#bb4d00"],
  isDark: false,
};

const FALLBACK_DARK_TOKENS: MapThemeTokens = {
  primary: "#e07a3d",
  primarySoft: "#9a4617",
  primaryForeground: "#ffffff",
  border: "#383838",
  muted: "#262626",
  mutedForeground: "#a3a3a3",
  background: "#171717",
  foreground: "#fafafa",
  destructive: "#ef4444",
  chartColors: ["#fbbf24", "#34d399", "#fb923c", "#e07a3d", "#a78bfa"],
  primaryRamp: ["#432212", "#693518", "#9a4c1f", "#c96228", "#e88446"],
  clusterColors: ["#f59e6c", "#e07a3d", "#b8551f"],
  isDark: true,
};

/** 构建面向浅色与深色底图可读性优化的语义色阶（全量派生自当前主题 CSS 变量） */
export function buildAdaptiveSchemeRamp(
  scheme: "primary" | "emerald" | "amber" | "rose" | "violet",
  tokens: MapThemeTokens,
): readonly string[] {
  if (scheme === "primary") return tokens.primaryRamp;
  const targets = {
    emerald: tokens.chartColors[1],
    amber: tokens.chartColors[0],
    rose: tokens.destructive,
    violet: tokens.chartColors[4],
  } as const;
  return buildRampFromBase(targets[scheme], tokens.background, tokens.muted, tokens.foreground, tokens.isDark);
}

let snapshotTokens: MapThemeTokens = FALLBACK_LIGHT_TOKENS;
const listeners = new Set<() => void>();
let observerStarted = false;

function readDomThemeTokens(): MapThemeTokens {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return FALLBACK_LIGHT_TOKENS;
  }

  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const fallback = isDark ? FALLBACK_DARK_TOKENS : FALLBACK_LIGHT_TOKENS;
  const styles = window.getComputedStyle(root);

  const readVar = (name: string, fb: string) => {
    const raw = styles.getPropertyValue(name);
    return raw ? resolveCssColorToHex(raw, fb) : fb;
  };

  const primary = readVar("--primary", fallback.primary);
  const background = readVar("--background", fallback.background);
  const foreground = readVar("--foreground", fallback.foreground);
  const muted = readVar("--muted", fallback.muted);
  const primaryRamp = buildRampFromBase(primary, background, muted, foreground, isDark);

  const chartColors = [
    readVar("--chart-1", fallback.chartColors[0]),
    readVar("--chart-2", fallback.chartColors[1]),
    readVar("--chart-3", fallback.chartColors[2]),
    readVar("--chart-4", fallback.chartColors[3]),
    readVar("--chart-5", fallback.chartColors[4]),
  ] as const;

  const borderRaw = styles.getPropertyValue("--border");
  const border = borderRaw ? resolveCssColorToHex(borderRaw, fallback.border) : fallback.border;

  return {
    primary,
    primarySoft: primaryRamp[2] ?? fallback.primarySoft,
    primaryForeground: readVar("--primary-foreground", fallback.primaryForeground),
    border: border.startsWith("rgba(") ? fallback.border : border,
    muted,
    mutedForeground: readVar("--muted-foreground", fallback.mutedForeground),
    background,
    foreground,
    destructive: readVar("--destructive", fallback.destructive),
    chartColors,
    primaryRamp,
    clusterColors: [primaryRamp[2], primaryRamp[3], primaryRamp[4]] as [string, string, string],
    isDark,
  };
}

function tokensEqual(a: MapThemeTokens, b: MapThemeTokens): boolean {
  return (
    a.isDark === b.isDark &&
    a.primary === b.primary &&
    a.primarySoft === b.primarySoft &&
    a.primaryForeground === b.primaryForeground &&
    a.border === b.border &&
    a.muted === b.muted &&
    a.mutedForeground === b.mutedForeground &&
    a.background === b.background &&
    a.foreground === b.foreground &&
    a.destructive === b.destructive &&
    a.chartColors.every((color, idx) => color === b.chartColors[idx]) &&
    a.primaryRamp.every((color, idx) => color === b.primaryRamp[idx])
  );
}

function refreshTokens(): void {
  clearColorNormalizationCache();
  const next = readDomThemeTokens();
  if (!tokensEqual(snapshotTokens, next)) {
    snapshotTokens = next;
    for (const cb of listeners) cb();
  }
}

function ensureObserver(): void {
  if (observerStarted || typeof window === "undefined" || typeof document === "undefined") return;
  observerStarted = true;
  snapshotTokens = readDomThemeTokens();

  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(refreshTokens);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
  }
}

function subscribe(cb: () => void): () => void {
  ensureObserver();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): MapThemeTokens {
  ensureObserver();
  return snapshotTokens;
}

const getServerSnapshot = (): MapThemeTokens => FALLBACK_LIGHT_TOKENS;

/** 订阅全站主题（light/dark + 5 套主题切换）并获取 WebGL 兼容的精确 HEX/RGBA 令牌。 */
export function useMapThemeTokens(): MapThemeTokens {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
