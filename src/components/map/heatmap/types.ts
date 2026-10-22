import type { Coordinates, MapCardSlotProps, MapCommonProps } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";

export interface HeatmapPoint {
  id?: string | number;
  coordinates: Coordinates; // [longitude, latitude]
  weight?: number; // density/intensity weight (e.g. 0 to 1 or count)
  extra?: Record<string, unknown>;
}

export type HeatmapColorRamp = "thermal" | "spectral" | "viridis" | "plasma" | "mono";

export interface GeoHeatmapMapProps extends MapCommonProps {
  /** Array of heatmap points (or alias 'points') */
  data?: HeatmapPoint[];
  points?: HeatmapPoint[];

  /** Input coordinate system: WGS84, GCJ02, BD09 (defaults to WGS84) */
  coordinateSystem?: CoordinateSystem;

  /** Initial or controlled map center [lng, lat] */
  center?: Coordinates;
  /** Initial or controlled map zoom level */
  zoom?: number;

  /** Radius of influence of each point in pixels (default: 25) */
  radius?: number;
  /** Maximum intensity scale for point weights (default: 1) */
  maxIntensity?: number;
  /** Property name on point object used for weight (default: "weight") */
  weightProperty?: string;

  /** Predefined color ramp preset */
  colorRamp?: HeatmapColorRamp;
  /** Custom color stops for heatmap density: Array of [density (0-1), colorString] */
  customColorRamp?: Array<[number, string]>;

  /** Opacity of the heatmap layer (default: 0.85) */
  opacity?: number;

  /** Whether to display the density legend card overlay */
  showLegend?: boolean;
  /** Title displayed on the legend card (default: "热力密度 (KDE)") */
  legendTitle?: string;

  /** Card wrapper props */
  cardProps?: MapCardSlotProps;

  /** Loading and error states */
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}
