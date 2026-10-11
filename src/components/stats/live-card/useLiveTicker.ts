import { useInterval, useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { useState } from "react";

import type { LiveStatus } from "./types";

export interface UseLiveTickerOptions {
  /** Initial scalar value */
  initialValue?: number;
  /** Initial historical array of values for sparkline buffer */
  initialData?: number[];
  /** Maximum number of data points to maintain in sliding window (default: 10) */
  bufferSize?: number;
  /** Refresh interval in milliseconds (default: 2000ms) */
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

export interface UseLiveTickerResult {
  value: number;
  sparklineData: number[];
  /** Buffer alias for sparklineData */
  buffer: number[];
  isRunning: boolean;
  status: LiveStatus;
  lastUpdated: string;
  toggle: () => void;
  start: () => void;
  stop: () => void;
  tick: () => void;
}

const DEFAULT_BUFFER = [42, 45, 48, 46, 52, 58, 55, 60];

export function useLiveTicker({
  initialValue = 1420,
  initialData = DEFAULT_BUFFER,
  bufferSize = 10,
  intervalMs = 2500,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  volatility,
  minJitter = -8,
  maxJitter = 12,
  autoStart = true,
}: UseLiveTickerOptions = {}): UseLiveTickerResult {
  const [value, setValue] = useState<number>(initialValue);
  const [sparklineData, setSparklineData] = useState<number[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<string>("刚刚");
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const toggle = useMemoizedFn(() => setIsRunning((prev) => !prev));
  const start = useMemoizedFn(() => setIsRunning(true));
  const stop = useMemoizedFn(() => setIsRunning(false));

  const tick = useMemoizedFn(() => {
    setValue((prevValue) => {
      let delta: number;
      if (volatility !== undefined) {
        const range = prevValue * volatility;
        delta = Math.round((Math.random() * 2 - 1) * range);
      } else {
        delta = Math.floor(Math.random() * (maxJitter - minJitter + 1)) + minJitter;
      }

      const nextValue = clamp(prevValue + delta, min, max);

      setSparklineData((prev) => {
        const nextBuffer = [...prev, nextValue];
        return nextBuffer.length > bufferSize ? nextBuffer.slice(nextBuffer.length - bufferSize) : nextBuffer;
      });

      return nextValue;
    });

    const now = new Date();
    const formattedTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLastUpdated(formattedTime);
  });

  useInterval(tick, isRunning ? intervalMs : undefined);

  const status: LiveStatus = isRunning ? "online" : "offline";

  return {
    value,
    sparklineData,
    buffer: sparklineData,
    isRunning,
    status,
    lastUpdated,
    toggle,
    start,
    stop,
    tick,
  };
}
