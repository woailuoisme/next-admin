"use client";

import { memo, useEffect } from "react";

import { useMap } from "@/components/ui/map";

import { isValidCoordinate } from "../utils/coordinates";

export interface MapFlyToProps {
  /** 目标中心（底图坐标系） */
  target: [number, number] | null;
  /** 缩放下限（默认 13）：避免从很远视角飞过去后仍看不出位置 */
  minZoom?: number;
  duration?: number;
}

/**
 * 平滑飞到目标中心的无渲染控制器
 *
 * 每次 `target` **引用**变化都会触发一次 flyTo，并校验坐标有限性。
 */
export const MapFlyTo = memo(function MapFlyTo({ target, minZoom = 13, duration = 1200 }: MapFlyToProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || !target || !isValidCoordinate(target)) return;

    map.flyTo({
      center: target,
      zoom: Math.max(map.getZoom(), minZoom),
      duration,
      essential: true,
    });
  }, [isLoaded, map, target, minZoom, duration]);

  return null;
});
