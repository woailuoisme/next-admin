import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { RouteStop, RouteTrackingMapProps } from "./types";

import { EMPTY_STOPS } from "../shared/constants";

/**
 * 路线回放状态机：支持受控/非受控进度、rAF 播放循环与站点状态派生
 */
export function useRouteTracking({
  coordinates,
  stops = EMPTY_STOPS,
  progress: controlledProgress,
  defaultProgress = 0,
  onProgressChange,
  autoPlay = false,
  playbackDuration = 15,
}: Pick<
  RouteTrackingMapProps,
  | "coordinates"
  | "stops"
  | "progress"
  | "defaultProgress"
  | "onProgressChange"
  | "autoPlay"
  | "playbackDuration"
>) {
  const [internalProgress, setInternalProgress] = useState(defaultProgress);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const isControlled = controlledProgress !== undefined;
  const currentProgress = isControlled ? controlledProgress : internalProgress;

  const onProgressChangeRef = useRef(onProgressChange);
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  // 最新进度引用：rAF 回调读取它，避免 effect 依赖 currentProgress 而逐帧重建
  const currentProgressRef = useRef(currentProgress);
  useEffect(() => {
    currentProgressRef.current = currentProgress;
  }, [currentProgress]);

  const updateProgress = useCallback(
    (newVal: number) => {
      const clamped = Math.max(0, Math.min(1, newVal));
      currentProgressRef.current = clamped;
      if (!isControlled) {
        setInternalProgress(clamped);
      }
      onProgressChangeRef.current?.(clamped);
    },
    [isControlled],
  );

  // Playback timer loop
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
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
      const nextProgress = Math.min(1, currentProgressRef.current + increment);

      updateProgress(nextProgress);

      if (nextProgress >= 1) {
        setIsPlaying(false);
      } else {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, playbackDuration, updateProgress]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentProgressRef.current >= 1) {
        updateProgress(0);
      }
      return !prev;
    });
  }, [updateProgress]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    updateProgress(0);
  }, [updateProgress]);

  // 离散化站点状态阶数：仅在站点状态阈值发生跳变时才重新分配 enrichedStops 数组引用，
  // 彻底避免 60-120 FPS 动画帧高频更新连续浮点数导致所有站点 Marker 每秒重渲染数十次
  const stopThresholdKey = useMemo(() => {
    if (stops.length <= 1) return "0";
    const count = stops.length;
    return stops
      .map((_, idx) => {
        const stopProgress = idx / Math.max(count - 1, 1);
        const isDone = currentProgress >= stopProgress;
        const isNext = !isDone && (idx === 0 || currentProgress >= (idx - 1) / (count - 1));
        return isDone ? "2" : isNext ? "1" : "0";
      })
      .join("");
  }, [stops, currentProgress]);

  const enrichedStops = useMemo<RouteStop[]>(() => {
    if (coordinates.length < 2 || stops.length === 0) return stops;
    return stops.map((stop, idx) => {
      if (stop.status) return stop;
      const code = stopThresholdKey[idx];
      return {
        ...stop,
        status: code === "2" ? "completed" : code === "1" ? "current" : "pending",
      };
    });
  }, [stops, coordinates, stopThresholdKey]);

  return {
    progress: currentProgress,
    isPlaying,
    togglePlay,
    seekTo: updateProgress,
    reset,
    enrichedStops,
  };
}
