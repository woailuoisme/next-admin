import type { ReactNode } from "react";

import type { MapCommonProps, MapFeedbackProps } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";

export type RouteStopStatus = "completed" | "current" | "pending";

export type RouteStop = {
  id: string;
  name: string;
  coordinates: [number, number];
  status?: RouteStopStatus;
  arrivalTime?: string;
  description?: string;
};

export type VehicleInfo = {
  id: string;
  name: string;
  licensePlate?: string;
  speed?: number; // km/h
  statusText?: string;
  avatarUrl?: string;
};

export type RouteTrackingMapProps = MapCommonProps &
  MapFeedbackProps & {
    /** Input coordinate system: WGS84, GCJ02, BD09 (defaults to WGS84) */
    coordinateSystem?: CoordinateSystem;

    /** Route coordinates list: [[lng, lat], ...] */
    coordinates: [number, number][];
    /** Optional station / delivery stops along the route */
    stops?: RouteStop[];
    /** Vehicle details */
    vehicle?: VehicleInfo;
    /** Current route progress (0 to 1). If provided, component acts in controlled mode */
    progress?: number;
    /** Default progress if uncontrolled */
    defaultProgress?: number;
    /** Progress change callback */
    onProgressChange?: (progress: number) => void;
    /** Auto-play trajectory playback on mount */
    autoPlay?: boolean;
    /** Playback duration in seconds for 0% -> 100% (default: 15s) */
    playbackDuration?: number;
    /** Whether to show the bottom playback scrubber bar */
    showScrubber?: boolean;
    /** Main route line color (defaults to primary) */
    routeColor?: string;
    /** Traveled route line color (defaults to primary-active) */
    traveledColor?: string;
    /** Route line width (default: 4) */
    routeWidth?: number;
    /** Click stop callback */
    onStopClick?: (stop: RouteStop) => void;
    /** Card container wrapper props */
    cardProps?: {
      title?: ReactNode;
      description?: ReactNode;
      collapsible?: boolean;
      fullscreenable?: boolean;
    };
  };
