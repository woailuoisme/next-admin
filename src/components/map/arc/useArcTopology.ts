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
    const nodes = new Map<string, ArcTopologyNode>();

    const addNode = (coordinates: Coordinates, name?: string, fallbackName = "Origin") => {
      const key = `${coordinates[0]},${coordinates[1]}`;
      const node = nodes.get(key);
      if (node) node.count += 1;
      else nodes.set(key, { name: name || fallbackName, coordinates, count: 1 });
    };

    for (const arc of normalizedArcs) {
      addNode(arc.from, arc.fromName, "Origin");
      addNode(arc.to, arc.toName, "Destination");
    }

    return Array.from(nodes.values());
  }, [normalizedArcs, showNodeMarkers]);

  return {
    normalizedArcs,
    computedCenter,
    uniqueNodes,
  };
}
