import type { ReactNode } from "react";

import type { BasemapPreset } from "../presets/basemaps";

export type Coordinates = [number, number]; // [lng, lat]

export interface MapCommonProps {
  height?: number | string;
  className?: string;
  basemap?: BasemapPreset;
  customStyleUrl?: { light?: string; dark?: string };
  blank?: boolean;
  center?: Coordinates;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  interactive?: boolean;
}

/** 各业务地图的 `cardProps` 入参（统一由 MapCard 消费） */
export interface MapCardSlotProps {
  title?: ReactNode;
  description?: ReactNode;
  fullscreenable?: boolean;
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
