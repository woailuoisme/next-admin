import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";

import type { ArcTopologyNode } from "./useArcTopology";

interface ArcNodeMarkerProps {
  node: ArcTopologyNode;
}

export const ArcNodeMarker = memo(function ArcNodeMarker({ node }: ArcNodeMarkerProps) {
  return (
    <MapMarker longitude={node.coordinates[0]} latitude={node.coordinates[1]}>
      <MarkerContent>
        <div className="group relative flex items-center justify-center">
          <span className="bg-primary/25 absolute -inset-1 rounded-full transition-all group-hover:scale-150" />
          <span className="border-background bg-primary relative size-3 rounded-full border-2 shadow-xs transition-transform group-hover:scale-125" />
        </div>
      </MarkerContent>
      <MarkerTooltip>
        <div className="flex items-center gap-1.5 px-1 py-0.5 text-xs font-semibold">
          <span>{node.name}</span>
          <Badge variant="secondary" className="px-1 py-0 text-[10px]">
            {node.count} routes
          </Badge>
        </div>
      </MarkerTooltip>
    </MapMarker>
  );
});
