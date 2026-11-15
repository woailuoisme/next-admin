import type { ReactNode } from "react";

import type { BasemapPreset } from "../presets/basemaps";
import type { CoordinateSystem } from "../utils/coordinates";

export type Coordinates = [number, number]; // [lng, lat]

export interface MapCommonProps {
  height?: number | string;
  className?: string;
  basemap?: BasemapPreset;
  /** 允许自定义底图覆盖默认 WGS84/GCJ02 坐标系推导 */
  basemapCRS?: CoordinateSystem;
  customStyleUrl?: { light?: string; dark?: string };
  blank?: boolean;
  center?: Coordinates;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  interactive?: boolean;
  projection?: "globe" | "mercator";
  /** 数据就绪后自动根据数据集边界框调整视野，默认按各组件能力开启 */
  autoFitBounds?: boolean;
  /** 可选受控底图切换回调（卡片模式下启用底图下拉选择器） */
  onBasemapChange?: (basemap: BasemapPreset) => void;
}

/** 各业务地图的 `cardProps` 入参（统一由 MapFrame / MapCard 消费） */
export interface MapCardSlotProps {
  title?: ReactNode;
  description?: ReactNode;
  fullscreenable?: boolean;
  showBasemapSelector?: boolean;
  actionSlot?: ReactNode;
  legendSlot?: ReactNode;
  footerSlot?: ReactNode;
}

export interface MapFeedbackProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
}
