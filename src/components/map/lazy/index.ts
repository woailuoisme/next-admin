import type { ArcFlightMapProps } from "../arc/types";
import type { GeoDistributionMapProps } from "../geo/types";
import type { GeoHeatmapMapProps } from "../heatmap/types";
import type { LocationMarkerMapProps } from "../markers/types";
import type { LocationPickerProps } from "../picker/types";
import type { RouteTrackingMapProps } from "../route/types";

import { createLazyMap } from "./createLazyMap";

export { createLazyMap };

export const LazyLocationMarkerMap = createLazyMap<LocationMarkerMapProps>(
  () =>
    import("../markers/LocationMarkerMap").then((m) => ({
      default: m.LocationMarkerMap,
    })),
  { defaultHeight: 460 },
);

export const LazyRouteTrackingMap = createLazyMap<RouteTrackingMapProps>(
  () =>
    import("../route/RouteTrackingMap").then((m) => ({
      default: m.RouteTrackingMap,
    })),
  { defaultHeight: 460 },
);

export const LazyGeoDistributionMap = createLazyMap<GeoDistributionMapProps>(
  () =>
    import("../geo/GeoDistributionMap").then((m) => ({
      default: m.GeoDistributionMap,
    })),
  { defaultHeight: 480 },
);

export const LazyArcFlightMap = createLazyMap<ArcFlightMapProps>(
  () =>
    import("../arc/ArcFlightMap").then((m) => ({
      default: m.ArcFlightMap,
    })),
  { defaultHeight: 480 },
);

export const LazyGeoHeatmapMap = createLazyMap<GeoHeatmapMapProps>(
  () =>
    import("../heatmap/GeoHeatmapMap").then((m) => ({
      default: m.GeoHeatmapMap,
    })),
  { defaultHeight: 500 },
);

export const LazyLocationPicker = createLazyMap<LocationPickerProps>(
  () =>
    import("../picker/LocationPicker").then((m) => ({
      default: m.LocationPicker,
    })),
  { defaultHeight: 320 },
);
