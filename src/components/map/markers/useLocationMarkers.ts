import type * as GeoJSON from "geojson";

import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import type { Coordinates } from "../shared/types";
import type { LocationMarkerItem, LocationMarkerMapProps } from "./types";

import { transformCoordinates } from "../utils/coordinates";

const EMPTY_MARKERS: LocationMarkerItem[] = [];
const DEFAULT_BEIJING_CENTER: Coordinates = [116.4074, 39.9042];

export function useLocationMarkers(props: LocationMarkerMapProps) {
  const sourceCoords = props.coordinateSystem ?? "WGS84";
  const targetCoords = props.basemap === "amap" ? "GCJ02" : "WGS84";
  const needsTransform = sourceCoords !== targetCoords;

  const data = useMemo(() => {
    const raw = props.data ?? props.locations ?? EMPTY_MARKERS;
    if (!needsTransform) return raw;
    return raw.map((item) => ({
      ...item,
      coordinates: transformCoordinates(item.coordinates, sourceCoords, targetCoords),
    }));
  }, [props.data, props.locations, needsTransform, sourceCoords, targetCoords]);

  const { center: propCenter, selectedId: controlledSelectedId, onMarkerSelect } = props;

  const [internalSelectedId, setInternalSelectedId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    props.defaultCategory && props.defaultCategory !== "all" ? props.defaultCategory : null,
  );

  const activeSelectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of data) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set);
  }, [data]);

  // Filter data by search query and category
  const filteredData = useMemo(() => {
    let list = data;

    if (selectedCategory) {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query),
      );
    }

    return list;
  }, [data, selectedCategory, searchQuery]);

  // Compute default center from data if not provided
  const computedCenter = useMemo<Coordinates>(() => {
    if (propCenter) {
      return needsTransform ? transformCoordinates(propCenter, sourceCoords, targetCoords) : propCenter;
    }
    if (filteredData.length === 0) return DEFAULT_BEIJING_CENTER; // Default Beijing if empty

    let sumLng = 0;
    let sumLat = 0;
    for (const item of filteredData) {
      sumLng += item.coordinates[0];
      sumLat += item.coordinates[1];
    }
    return [sumLng / filteredData.length, sumLat / filteredData.length];
  }, [propCenter, filteredData, needsTransform, sourceCoords, targetCoords]);

  // Convert filtered data to GeoJSON FeatureCollection for MapClusterLayer
  const geojsonData = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(() => {
    return {
      type: "FeatureCollection",
      features: filteredData.map((item) => ({
        type: "Feature",
        id: item.id,
        properties: {
          id: item.id,
          title: item.title,
          category: item.category,
          status: item.status,
          color: item.color,
        },
        geometry: {
          type: "Point",
          coordinates: item.coordinates,
        },
      })),
    };
  }, [filteredData]);

  const selectedMarker = useMemo(() => {
    if (!activeSelectedId) return null;
    return data.find((m) => m.id === activeSelectedId) ?? null;
  }, [data, activeSelectedId]);

  const handleSelectMarker = useMemoizedFn((marker: LocationMarkerItem | null) => {
    if (controlledSelectedId === undefined) {
      setInternalSelectedId(marker ? marker.id : null);
    }
    onMarkerSelect?.(marker);
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredData,
    geojsonData,
    computedCenter,
    selectedMarker,
    handleSelectMarker,
  };
}
