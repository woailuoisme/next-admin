"use client";

import { useInterval } from "ahooks";
import { clamp } from "es-toolkit";
import { useFormatter, useTranslations } from "next-intl";
import { useRef, useState } from "react";

import type { LiveStatus } from "@/components/stats/live-card/types";

export interface UseDemoTelemetryTickerOptions {
  /** Initial scalar value */
  initialValue?: number;
  /** Initial historical array of values for sparkline window */
  initialData?: number[];
  /** Maximum number of data points to maintain in sliding window (default: 10) */
  bufferSize?: number;
  /** Refresh interval in milliseconds (default: 2500ms) */
  intervalMs?: number;
  /** Lower bound clamp */
  min?: number;
  /** Upper bound clamp */
  max?: number;
  /** Relative volatility ratio (e.g. 0.04 means +-4% of value per tick) */
  volatility?: number;
  /** Minimum random jitter delta added per tick (default: -8) */
  minJitter?: number;
  /** Maximum random jitter delta added per tick (default: 12) */
  maxJitter?: number;
  /** Whether the interval starts running automatically (default: true) */
  autoStart?: boolean;
}

export interface UseDemoTelemetryTickerResult {
  value: number;
  sparklineData: number[];
  isRunning: boolean;
  status: LiveStatus;
  lastUpdated: string;
  toggle: () => void;
  start: () => void;
  stop: () => void;
  tick: () => void;
}

const DEFAULT_HISTORY = [42, 45, 48, 46, 52, 58, 55, 60];

/**
 * Demo-only telemetry simulator hook scoped to the Stats showcase feature.
 */
export function useDemoTelemetryTicker({
  initialValue = 1420,
  initialData = DEFAULT_HISTORY,
  bufferSize = 10,
  intervalMs = 2500,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  volatility,
  minJitter = -8,
  maxJitter = 12,
  autoStart = true,
}: UseDemoTelemetryTickerOptions = {}): UseDemoTelemetryTickerResult {
  const t = useTranslations("stats");
  const format = useFormatter();
  const [value, setValue] = useState<number>(initialValue);
  const valueRef = useRef<number>(initialValue);
  const [sparklineData, setSparklineData] = useState<number[]>(initialData);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);

  const toggle = () => setIsRunning((prev) => !prev);
  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);

  const tick = () => {
    const prevValue = valueRef.current;
    let delta: number;
    if (volatility !== undefined) {
      const range = prevValue * volatility;
      delta = Math.round((Math.random() * 2 - 1) * range);
    } else {
      delta = Math.floor(Math.random() * (maxJitter - minJitter + 1)) + minJitter;
    }

    const nextValue = clamp(prevValue + delta, min, max);
    valueRef.current = nextValue;
    setValue(nextValue);

    setSparklineData((prev) => {
      const nextSeries = [...prev, nextValue];
      return nextSeries.length > bufferSize ? nextSeries.slice(nextSeries.length - bufferSize) : nextSeries;
    });

    setLastUpdatedTime(
      format.dateTime(new Date(), {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  };

  useInterval(tick, isRunning ? intervalMs : undefined);

  const status: LiveStatus = isRunning ? "online" : "offline";
  const lastUpdated = lastUpdatedTime ?? t("just_now");

  return {
    value,
    sparklineData,
    isRunning,
    status,
    lastUpdated,
    toggle,
    start,
    stop,
    tick,
  };
}
