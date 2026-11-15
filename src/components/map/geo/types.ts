import type { MapCardSlotProps, MapCommonProps, MapFeedbackProps } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";

export type ChoroplethColorScheme = "primary" | "emerald" | "amber" | "rose" | "violet";

export type GeoDistributionMapProps = MapCommonProps &
  MapFeedbackProps & {
    /** Input coordinate system: WGS84, GCJ02, or BD09. Defaults to WGS84 */
    coordinateSystem?: CoordinateSystem;
    /** GeoJSON data (FeatureCollection, Feature, or url string) */
    data: GeoJSON.FeatureCollection | GeoJSON.Feature | string;
    /** Key in feature.properties representing the numeric metric value (default: "value") */
    valueKey?: string;
    /** Key in feature.properties representing the region title (default: "name") */
    labelKey?: string;
    /** Value unit suffix (e.g. "orders", "¥", "k") */
    unit?: string;
    /** Palette theme for choropleth gradient steps */
    colorScheme?: ChoroplethColorScheme;
    /** Promote a specific feature property to feature id (default: "id") */
    promoteId?: string;
    /** Custom fill opacity (default: 0.75) */
    fillOpacity?: number;
    /** Custom border line color (default: resolved --border token) */
    borderColor?: string;
    /** Custom border width (default: 1) */
    borderWidth?: number;
    /** Show bottom legend swatch bar (default: true) */
    showLegend?: boolean;
    /** Title label for the legend */
    legendTitle?: string;
    /** Feature click handler */
    onFeatureClick?: (feature: GeoJSON.Feature, properties: Record<string, unknown>) => void;
    /** Card container wrapper props */
    cardProps?: MapCardSlotProps;
  };
