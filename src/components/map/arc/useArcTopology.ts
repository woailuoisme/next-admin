import { useMemo } from "react";

import type { Coordinates } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";
import type { FlightArcItem } from "./types";

import { DEFAULT_MAP_CENTER } from "../shared/constants";
import { transformCoordinates } from "../utils/coordinates";

interface UseArcTopologyOptions {
  arcs?: FlightArcItem[];
  center?: Coordinates;
  coordinateSystem?: CoordinateSystem;
  basemap?: string;
  showNodeMarkers?: boolean;
}

export interface ArcTopologyNode {
  name: string;
  coordinates: Coordinates;
  count: number;
}

const EMPTY_NODES: ArcTopologyNode[] = [];

export function useArcTopology({
  arcs,
  center = DEFAULT_MAP_CENTER,
  coordinateSystem = "WGS84",
  basemap = "carto",
  showNodeMarkers = true,
}: UseArcTopologyOptions) {
  const sourceCoords = coordinateSystem;
  const targetCoords = basemap === "amap" ? "GCJ02" : "WGS84";
  const needsTransform = sourceCoords !== targetCoords;

  const normalizedArcs = useMemo(() => {
    if (!needsTransform || !arcs) return arcs;
    return arcs.map((arc) => ({
      ...arc,
      from: transformCoordinates(arc.from, sourceCoords, targetCoords),
      to: transformCoordinates(arc.to, sourceCoords, targetCoords),
    }));
  }, [arcs, needsTransform, sourceCoords, targetCoords]);

  const computedCenter = useMemo(() => {
    return needsTransform ? transformCoordinates(center, sourceCoords, targetCoords) : center;
  }, [center, needsTransform, sourceCoords, targetCoords]);

  // Extract unique city/terminal nodes from arcs
  const uniqueNodes = useMemo<ArcTopologyNode[]>(() => {
    if (!showNodeMarkers || !normalizedArcs) return EMPTY_NODES;
    const map = new Map<string, ArcTopologyNode>();

    for (const arc of normalizedArcs) {
      const fromKey = `${arc.from[0]},${arc.from[1]}`;
      const toKey = `${arc.to[0]},${arc.to[1]}`;

      const existingFrom = map.get(fromKey);
      if (existingFrom) {
        existingFrom.count += 1;
      } else {
        map.set(fromKey, {
          name: arc.fromName || "Origin",
          coordinates: arc.from,
          count: 1,
        });
      }

      const existingTo = map.get(toKey);
      if (existingTo) {
        existingTo.count += 1;
      } else {
        map.set(toKey, {
          name: arc.toName || "Destination",
          coordinates: arc.to,
          count: 1,
        });
      }
    }

    return Array.from(map.values());
  }, [normalizedArcs, showNodeMarkers]);

  return {
    normalizedArcs,
    computedCenter,
    uniqueNodes,
  };
}
