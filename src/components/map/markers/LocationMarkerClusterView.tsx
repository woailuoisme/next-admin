import type * as GeoJSON from "geojson";

import { memo } from "react";

import { MapClusterLayer } from "@/components/ui/map";

import type { LocationMarkerItem } from "./types";

import { MAP_PRIMARY } from "../shared/constants";
import { LocationMarkerPin } from "./LocationMarkerPin";

interface LocationMarkerClusterViewProps {
  geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point>;
  enableClustering: boolean;
  clusterRadius: number;
  clusterMaxZoom: number;
  filteredData: LocationMarkerItem[];
  selectedMarker: LocationMarkerItem | null;
  onSelectMarker: (item: LocationMarkerItem | null) => void;
  renderPopup?: (item: LocationMarkerItem) => React.ReactNode;
}

export const LocationMarkerClusterView = memo(function LocationMarkerClusterView({
  geojsonData,
  enableClustering,
  clusterRadius,
  clusterMaxZoom,
  filteredData,
  selectedMarker,
  onSelectMarker,
  renderPopup,
}: LocationMarkerClusterViewProps) {
  return (
    <>
      <MapClusterLayer
        data={geojsonData}
        clusterRadius={enableClustering ? clusterRadius : 1}
        clusterMaxZoom={clusterMaxZoom}
        pointColor={MAP_PRIMARY}
        onPointClick={(feature) => {
          const featureId = feature.properties?.id;
          const item = filteredData.find((d) => String(d.id) === String(featureId));
          if (item) onSelectMarker(item);
        }}
      />

      {/* Promote selected marker to interactive DOM marker with pulse & popup */}
      {selectedMarker ? (
        <LocationMarkerPin
          key={`canvas-selected-${selectedMarker.id}`}
          item={selectedMarker}
          isSelected={true}
          onSelect={onSelectMarker}
          renderPopup={renderPopup}
        />
      ) : null}
    </>
  );
});
