import type { BasemapPreset } from "../presets/basemaps";

export type Coordinates = [number, number]; // [lng, lat]

export interface MapCoordinates {
  lng: number;
  lat: number;
}

export interface MapCommonProps {
  height?: number | string;
  className?: string;
  basemap?: BasemapPreset;
  customStyleUrl?: { light?: string; dark?: string };
  blank?: boolean;
  isBlank?: boolean;
  center?: Coordinates;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  interactive?: boolean;
  isInteractive?: boolean;
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
