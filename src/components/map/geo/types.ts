import type { MapCardSlotProps, MapCommonProps, MapFeedbackProps } from "../shared/types";

export type ChoroplethColorScheme = "primary" | "emerald" | "amber" | "rose" | "violet";

export type GeoDistributionMapProps = MapCommonProps &
  MapFeedbackProps & {
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
    /** Promote a specific feature property to feature id (default: "id" or "name") */
    promoteId?: string;
    /** Custom fill opacity (default: 0.8) */
    fillOpacity?: number;
    /** Custom border line color (default: card border) */
    borderColor?: string;
    /** Custom border width (default: 1) */
    borderWidth?: number;
    /** Show bottom or top legend swatch bar (default: true) */
    showLegend?: boolean;
    /** Title label for the legend */
    legendTitle?: string;
    /** Feature click handler */
    onFeatureClick?: (feature: GeoJSON.Feature, properties: Record<string, unknown>) => void;
    /** Card container wrapper props */
    cardProps?: MapCardSlotProps;
  };
