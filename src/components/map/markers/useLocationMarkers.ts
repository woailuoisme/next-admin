"use client";

import type * as GeoJSON from "geojson";

import { useMemoizedFn } from "ahooks";
import { useDeferredValue, useMemo, useState } from "react";

import type { BasemapPreset } from "../presets/basemaps";
import type { Coordinates } from "../shared/types";
import type { LocationMarkerItem, LocationMarkerMapProps } from "./types";

import { DEFAULT_BEIJING_CENTER } from "../shared/constants";
import { isValidCoordinate, resolveCoordinateSystems, transformCoordinates } from "../utils/coordinates";
import { resolveBoundingCenter } from "../utils/geoEngine";

const EMPTY_MARKERS: LocationMarkerItem[] = [];

export function useLocationMarkers(props: LocationMarkerMapProps & { activeBasemap?: BasemapPreset }) {
  const effectiveBasemap = props.activeBasemap ?? props.basemap;
  const { sourceCoords, targetCoords, needsTransform } = resolveCoordinateSystems(
    props.coordinateSystem,
    effectiveBasemap,
    props.basemapCRS,
  );

  const rawItems = props.data ?? props.locations ?? EMPTY_MARKERS;

  // 避免大批量网点坐标转换在无关渲染时重复执行
  const data = useMemo(() => {
    const validRaw = rawItems.filter((item) => isValidCoordinate(item.coordinates));
    if (!needsTransform) return validRaw;
    return validRaw.map((item) => ({
      ...item,
      coordinates: transformCoordinates(item.coordinates, sourceCoords, targetCoords),
    }));
  }, [rawItems, needsTransform, sourceCoords, targetCoords]);

  const { center: propCenter, selectedId: controlledSelectedId, onMarkerSelect } = props;

  const [internalSelectedId, setInternalSelectedId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    props.defaultCategory && props.defaultCategory !== "all" ? props.defaultCategory : null,
  );

  const activeSelectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  // 避免大批量网点分类统计在筛选与选中切换时重复遍历
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of data) {
      if (item.category) {
        counts[item.category] = (counts[item.category] ?? 0) + 1;
      }
    }
    return { categories: Object.keys(counts), categoryCounts: counts };
  }, [data]);

  // 避免大批量网点模糊检索在无关渲染时重复过滤
  const filteredData = useMemo(() => {
    let list = data;

    if (selectedCategory) {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query),
      );
    }

    return list;
  }, [data, selectedCategory, deferredSearchQuery]);

  // 避免大批量网点索引表与边界点列在选中态切换时重建
  const filteredLookup = useMemo(() => {
    const index = new Map<string, LocationMarkerItem>();
    for (const item of filteredData) {
      index.set(String(item.id), item);
    }
    return index;
  }, [filteredData]);

  // 稳定传给 MapFitBounds useEffect 的坐标数组引用
  const filteredPoints = useMemo<Coordinates[]>(() => filteredData.map((item) => item.coordinates), [filteredData]);

  const explicitCenter =
    propCenter && isValidCoordinate(propCenter)
      ? needsTransform
        ? transformCoordinates(propCenter, sourceCoords, targetCoords)
        : propCenter
      : undefined;
  const computedCenter = resolveBoundingCenter(filteredPoints, explicitCenter, DEFAULT_BEIJING_CENTER);

  // 避免大批量 GeoJSON 要素集合在选中态切换时重复构建
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

  const selectedMarker =
    activeSelectedId === null || activeSelectedId === undefined
      ? null
      : (data.find((m) => String(m.id) === String(activeSelectedId)) ?? null);

  const handleSelectMarker = useMemoizedFn((marker: LocationMarkerItem | null) => {
    if (controlledSelectedId === undefined) {
      setInternalSelectedId(marker ? marker.id : null);
    }
    onMarkerSelect?.(marker);
  });

  return {
    totalCount: data.length,
    searchQuery,
    deferredSearchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    categoryCounts,
    filteredData,
    filteredLookup,
    filteredPoints,
    geojsonData,
    computedCenter,
    selectedMarker,
    handleSelectMarker,
  };
}
