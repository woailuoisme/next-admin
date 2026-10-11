import { memo, useEffect } from "react";

import { useMap } from "@/components/ui/map";

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
 * 每次 `target` **引用**变化都会触发一次 flyTo —— 调用方只要传入新数组，
 * 即可对同一坐标重复定位（例如重复点「确认」）。
 */
export const MapFlyTo = memo(function MapFlyTo({ target, minZoom = 13, duration = 1200 }: MapFlyToProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || !target) return;

    map.flyTo({
      center: target,
      zoom: Math.max(map.getZoom(), minZoom),
      duration,
      essential: true,
    });
  }, [map, target, minZoom, duration]);

  return null;
});
