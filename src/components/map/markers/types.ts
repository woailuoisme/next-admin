import type { ReactNode } from "react";

import type { Coordinates, MapCommonProps } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";

export interface LocationMarkerItem {
  id: string | number;
  title: string;
  coordinates: Coordinates; // [longitude, latitude]
  category?: string;
  status?: "active" | "warning" | "inactive" | string;
  address?: string;
  phone?: string;
  description?: string;
  badge?: string;
  color?: string;
  extra?: Record<string, unknown>;
}

export interface LocationMarkerMapProps extends MapCommonProps {
  /** Array of location markers (or use alias 'locations') */
  data?: LocationMarkerItem[];
  /** Alias for data */
  locations?: LocationMarkerItem[];

  /** Input coordinate system: WGS84, GCJ02, or BD09. Defaults to WGS84 */
  coordinateSystem?: CoordinateSystem;

  /**
   * Rendering engine strategy:
   * - "auto": Use DOM markers if count < tierThreshold, otherwise GPU Canvas/Cluster (default)
   * - "dom": Force interactive DOM elements (best for < 200 nodes)
   * - "canvas": Force GPU WebGL GeoJSON layers (best for 200 ~ 50,000+ nodes)
   */
  renderMode?: "auto" | "dom" | "canvas";

  /** Threshold to switch from DOM markers to GPU canvas in "auto" mode (default: 200) */
  tierThreshold?: number;

  /** Initial or controlled map center [lng, lat] */
  center?: Coordinates;
  /** Initial or controlled map zoom level */
  zoom?: number;

  /** Whether to group points into clusters at lower zoom levels (default: true) */
  enableClustering?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;

  /** Selected marker ID */
  selectedId?: string | number | null;
  /** Callback when a marker is clicked or selected from list */
  onMarkerSelect?: (marker: LocationMarkerItem | null) => void;

  /** Whether to display a floating search input inside the map */
  showSearch?: boolean;
  /** Custom search input placeholder */
  searchPlaceholder?: string;
  /** Whether to display category filter chips */
  showCategoryFilter?: boolean;
  /** Whether to render a side list of locations next to the map */
  showSidebarList?: boolean;

  /** Custom marker popup render prop */
  renderPopup?: (marker: LocationMarkerItem) => ReactNode;

  /** Map projection mode: 'globe' or 'mercator' */
  projection?: "globe" | "mercator";

  /** Loading state */
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;

  /** Default category selected */
  defaultCategory?: string;

  /** Card wrapper props */
  cardProps?: {
    title?: ReactNode;
    description?: ReactNode;
    collapsible?: boolean;
    fullscreenable?: boolean;
  };
}

export interface MarkerCategoryFilter {
  label: string;
  value: string;
  count?: number;
}
