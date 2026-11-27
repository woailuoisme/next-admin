"use client";

import { useMemo } from "react";

import type { BasemapPreset } from "../presets/basemaps";
import type { Coordinates } from "../shared/types";
import type { ArcFlightItem } from "./types";

import { DEFAULT_BEIJING_CENTER } from "../shared/constants";
import { resolveCssColorToHex, useMapThemeTokens } from "../shared/tokenBridge";
import {
  type CoordinateSystem,
  isValidCoordinate,
  resolveCoordinateSystems,
  transformCoordinates,
} from "../utils/coordinates";
import { resolveBoundingCenter } from "../utils/geoEngine";

export interface ResolvedArcItem extends Omit<ArcFlightItem, "id"> {
  id: string;
  rawArc: ArcFlightItem;
  from: Coordinates;
  to: Coordinates;
}

export interface ArcNodePoint {
  id: string;
  label?: string;
  lngLat: Coordinates;
  count: number;
}

interface UseArcTopologyOptions {
  data: ArcFlightItem[];
  coordinateSystem?: CoordinateSystem;
  activeBasemap: BasemapPreset;
  basemapCRS?: CoordinateSystem;
  center?: Coordinates;
  arcColor?: string;
  arcHoverColor?: string;
}

export function useArcTopology({
  data,
  coordinateSystem = "WGS84",
  activeBasemap,
  basemapCRS,
  center,
  arcColor,
  arcHoverColor,
}: UseArcTopologyOptions) {
  const tokens = useMapThemeTokens();

  const { sourceCoords, targetCoords } = resolveCoordinateSystems(coordinateSystem, activeBasemap, basemapCRS);

  const resolvedArcColor = arcColor ? resolveCssColorToHex(arcColor, tokens.primary) : tokens.primary;

  const resolvedHoverColor = arcHoverColor
    ? resolveCssColorToHex(arcHoverColor, tokens.destructive)
    : tokens.foreground;

  // 隔离大批量航线坐标转换与节点聚合计算
  const { arcsData, arcLookup, nodes, allPoints } = useMemo(() => {
    const resolved: ResolvedArcItem[] = [];
    const lookup = new Map<string, ArcFlightItem>();
    const nodeMap = new Map<string, ArcNodePoint>();
    const points: Coordinates[] = [];

    for (const item of data) {
      if (!isValidCoordinate(item.from) || !isValidCoordinate(item.to)) continue;
      const from = transformCoordinates(item.from, sourceCoords, targetCoords);
      const to = transformCoordinates(item.to, sourceCoords, targetCoords);
      if (!isValidCoordinate(from) || !isValidCoordinate(to)) continue;

      const resolvedItem: ResolvedArcItem = {
        ...item,
        rawArc: item,
        from,
        to,
        color: item.color ? resolveCssColorToHex(item.color, resolvedArcColor) : undefined,
      };
      resolved.push(resolvedItem);
      lookup.set(item.id, item);
      points.push(from, to);

      const addNode = (coords: Coordinates, label?: string) => {
        const key = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;
        const existing = nodeMap.get(key);
        if (existing) {
          existing.count += 1;
          if (!existing.label && label) existing.label = label;
        } else {
          nodeMap.set(key, { id: key, label, lngLat: coords, count: 1 });
        }
      };

      addNode(from, item.fromLabel ?? item.fromName);
      addNode(to, item.toLabel ?? item.toName);
    }

    return {
      arcsData: resolved,
      arcLookup: lookup,
      nodes: Array.from(nodeMap.values()),
      allPoints: points,
    };
  }, [data, resolvedArcColor, sourceCoords, targetCoords]);

  const computedCenter = resolveBoundingCenter(allPoints, center, DEFAULT_BEIJING_CENTER);

  return {
    arcsData,
    arcLookup,
    nodes,
    allPoints,
    computedCenter,
    resolvedArcColor,
    resolvedHoverColor,
  };
}
