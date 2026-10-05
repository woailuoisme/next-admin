import { MapFlyTo } from "../shared/MapFlyTo";

interface LocationMarkerFlyToProps {
  target: [number, number] | null;
}

/**
 * 选中标记变化时平滑移动到该点
 *
 * 实现收敛到共享的 `MapFlyTo`，避免与 picker 等其他调用方各写一份 flyTo 参数。
 */
export function LocationMarkerFlyTo({ target }: LocationMarkerFlyToProps) {
  return <MapFlyTo target={target} minZoom={13} />;
}
