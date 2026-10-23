import { Navigation, Truck } from "lucide-react";
import { memo } from "react";

import { MarkerContent, MarkerPopup, RouteMarker } from "@/components/ui/map";

import type { VehicleInfo } from "./types";

interface VehicleMarkerProps {
  vehicle?: VehicleInfo;
  progress: number;
}

export const VehicleMarker = memo(function VehicleMarker({ vehicle, progress }: VehicleMarkerProps) {
  return (
    <RouteMarker at="progress">
      <MarkerContent>
        <div className="relative flex items-center justify-center">
          <span className="bg-primary/30 absolute -inset-2.5 animate-ping rounded-full" />
          <div className="border-background bg-primary text-primary-foreground relative flex size-8 items-center justify-center rounded-full border-2 shadow-lg">
            <Navigation className="size-4 rotate-45" />
          </div>
        </div>
      </MarkerContent>
      <MarkerPopup className="w-56 p-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full">
            <Truck className="size-4" />
          </div>
          <div>
            <h4 className="text-sm leading-tight font-semibold">{vehicle?.name || "Vehicle in transit"}</h4>
            {vehicle?.licensePlate ? <p className="text-muted-foreground text-xs">{vehicle.licensePlate}</p> : null}
          </div>
        </div>
        <div className="border-border mt-2.5 flex items-center justify-between border-t pt-2 text-xs">
          <span className="text-muted-foreground">Speed</span>
          <span className="text-primary font-semibold">{vehicle?.speed ?? 60} km/h</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{Math.round(progress * 100)}%</span>
        </div>
      </MarkerPopup>
    </RouteMarker>
  );
});
