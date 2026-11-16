"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import type { RouteStop, RouteStopStatus, RouteTrackingMapProps } from "./types";

import { EMPTY_STOPS } from "../shared/constants";

function subscribeReducedMotion(listener: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function deriveStopStatuses(stops: readonly RouteStop[], progress: number): RouteStopStatus[] {
  if (stops.length === 0) return [];
  if (stops.length === 1) return [progress >= 1 ? "completed" : "pending"];
  const maxIdx = stops.length - 1;
  return stops.map((_, idx) => {
    const stopProgress = idx / maxIdx;
    if (progress >= stopProgress) return "completed";
    if (idx === 0 || progress >= (idx - 1) / maxIdx) return "current";
    return "pending";
  });
}

function areStopStatusesEqual(a: readonly RouteStopStatus[], b: readonly RouteStopStatus[]): boolean {
  return a.length === b.length && a.every((status, idx) => status === b[idx]);
}

export interface RouteProgressStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getServerSnapshot: () => number;
}

/**
 * 路线回放状态机：
 * - 通过外部订阅 Store 暴露连续浮点数 progress，使主地图树、MapFrame 与 StopMarker 在 60fps 回放期零重渲染；
 * - 仅在站点状态离散阶跃时更新 enrichedStops；
 * - 支持 `enabled` 门控（加载态/错误态/空数据态自动挂起 rAF 循环）。
 */
export function useRouteTracking({
  coordinates,
  stops = EMPTY_STOPS,
  progress: controlledProgress,
  defaultProgress = 0,
  onProgressChange,
  autoPlay = false,
  playbackDuration = 15,
  enabled = true,
}: Pick<
  RouteTrackingMapProps,
  "coordinates" | "stops" | "progress" | "defaultProgress" | "onProgressChange" | "autoPlay" | "playbackDuration"
> & { enabled?: boolean }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [prevAutoPlay, setPrevAutoPlay] = useState(autoPlay);
  const [userPlayingOverride, setUserPlayingOverride] = useState<boolean | null>(null);

  if (autoPlay !== prevAutoPlay) {
    setPrevAutoPlay(autoPlay);
    setUserPlayingOverride(null);
  }

  const isPlaying = userPlayingOverride ?? (autoPlay && !prefersReducedMotion);
  const isControlled = controlledProgress !== undefined;

  const initialProgress = Math.max(0, Math.min(1, controlledProgress ?? defaultProgress));
  const serverSnapshotRef = useRef(initialProgress);
  const progressRef = useRef<number>(initialProgress);
  const listenersRef = useRef(new Set<() => void>());
  const onProgressChangeRef = useRef(onProgressChange);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  const [stopStatuses, setStopStatuses] = useState<RouteStopStatus[]>(() => deriveStopStatuses(stops, initialProgress));

  const emitProgress = useCallback(
    (nextVal: number) => {
      const clamped = Math.max(0, Math.min(1, nextVal));
      if (clamped === progressRef.current) return;
      progressRef.current = clamped;
      for (const listener of listenersRef.current) listener();

      const nextStatuses = deriveStopStatuses(stops, clamped);
      setStopStatuses((prev) => (areStopStatusesEqual(prev, nextStatuses) ? prev : nextStatuses));
    },
    [stops],
  );

  // Sync controlled progress without rebuilding rAF effect
  useEffect(() => {
    if (isControlled && controlledProgress !== undefined) {
      emitProgress(controlledProgress);
    }
  }, [isControlled, controlledProgress, emitProgress]);

  const updateProgress = useCallback(
    (newVal: number) => {
      const clamped = Math.max(0, Math.min(1, newVal));
      if (!isControlled) {
        emitProgress(clamped);
      }
      onProgressChangeRef.current?.(clamped);
    },
    [isControlled, emitProgress],
  );

  const progressStore = useMemo<RouteProgressStore>(
    () => ({
      subscribe: (listener: () => void) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getSnapshot: () => progressRef.current,
      getServerSnapshot: () => serverSnapshotRef.current,
    }),
    [],
  );

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !isPlaying || coordinates.length < 2) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const increment = delta / Math.max(playbackDuration, 1);
      const nextProgress = Math.min(1, progressRef.current + increment);

      updateProgress(nextProgress);

      if (nextProgress >= 1) {
        lastTimeRef.current = null;
        setUserPlayingOverride(false);
      } else {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [enabled, isPlaying, coordinates.length, playbackDuration, updateProgress]);

  const togglePlay = useCallback(() => {
    if (!isPlaying && progressRef.current >= 1) {
      lastTimeRef.current = null;
      updateProgress(0);
    }
    setUserPlayingOverride(!isPlaying);
  }, [isPlaying, updateProgress]);

  const reset = useCallback(() => {
    lastTimeRef.current = null;
    setUserPlayingOverride(false);
    updateProgress(0);
  }, [updateProgress]);

  const enrichedStops = useMemo<RouteStop[]>(() => {
    if (stops.length === 0) return EMPTY_STOPS;
    return stops.map((stop, idx) => {
      if (stop.status) return stop;
      return {
        ...stop,
        status: stopStatuses[idx] ?? "pending",
      };
    });
  }, [stops, stopStatuses]);

  return {
    progressStore,
    isPlaying,
    togglePlay,
    seekTo: updateProgress,
    reset,
    enrichedStops,
  };
}
