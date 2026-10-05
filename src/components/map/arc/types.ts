import type { ReactNode } from "react";

import type { MapCommonProps, MapFeedbackProps } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";

export type FlightArcItem = {
  id: string;
  from: [number, number];
  to: [number, number];
  fromName?: string;
  toName?: string;
  value?: number;
  category?: string;
  color?: string;
  [key: string]: unknown;
};

export type ArcFlightMapProps = MapCommonProps &
  MapFeedbackProps & {
    /** Input coordinate system: WGS84, GCJ02, BD09 (defaults to WGS84) */
    coordinateSystem?: CoordinateSystem;

    /** List of arcs to render */
    arcs: FlightArcItem[];
    /** Curvature factor: 0 is straight, higher is more curved (default: 0.25) */
    curvature?: number;
    /** Arc curve samples (default: 64) */
    samples?: number;
    /** Default arc line color (defaults to primary) */
    arcColor?: string;
    /** Default arc line width (default: 2) */
    arcWidth?: number;
    /** Default arc line opacity (default: 0.8) */
    arcOpacity?: number;
    /** Hover arc line width (default: 3.5) */
    hoverArcWidth?: number;
    /** Hover arc line color */
    hoverArcColor?: string;
    /** Whether to render anchor markers on origin and destination points (default: true) */
    showNodeMarkers?: boolean;
    /** Click arc callback */
    onArcClick?: (arc: FlightArcItem) => void;
    /** Hover arc callback */
    onArcHover?: (arc: FlightArcItem | null) => void;
    /** Card container wrapper props */
    cardProps?: {
      title?: ReactNode;
      description?: ReactNode;
      collapsible?: boolean;
      fullscreenable?: boolean;
    };
  };
