import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { memo, type ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { RouteStop, RouteStopStatus } from "./types";

interface StopMarkerProps {
  stop: RouteStop;
  onStopClick?: (stop: RouteStop) => void;
}

/**
 * 站点状态 → 标记配色 / 图标 / 徽章变体
 * 业务状态色统一收敛于此表，避免散落在 JSX 中
 */
const STOP_STATUS_STYLES: Record<
  RouteStopStatus,
  {
    marker: string;
    Icon: ComponentType<{ className?: string }>;
    iconExtra?: string;
    badge: "default" | "secondary" | "outline";
  }
> = {
  completed: {
    marker: "bg-emerald-500 text-white",
    Icon: CheckCircle2,
    badge: "default",
  },
  current: {
    marker: "bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-2",
    Icon: Clock,
    iconExtra: "animate-pulse",
    badge: "secondary",
  },
  pending: {
    marker: "bg-muted text-muted-foreground",
    Icon: MapPin,
    badge: "outline",
  },
};

export const StopMarker = memo(function StopMarker({ stop, onStopClick }: StopMarkerProps) {
  const status = stop.status ?? "pending";
  const { marker, Icon, iconExtra, badge } = STOP_STATUS_STYLES[status];

  return (
    <MapMarker longitude={stop.coordinates[0]} latitude={stop.coordinates[1]} onClick={() => onStopClick?.(stop)}>
      <MarkerContent>
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-full border-2 border-background shadow-md transition-transform hover:scale-110",
            marker,
          )}
        >
          <Icon className={cn("size-3.5", iconExtra)} />
        </div>
      </MarkerContent>
      <MarkerPopup className="w-48 p-2.5">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs leading-tight font-semibold">{stop.name}</h4>
          <Badge variant={badge} className="text-[10px] uppercase">
            {stop.status}
          </Badge>
        </div>
        {stop.arrivalTime ? (
          <p className="text-muted-foreground mt-1 text-[11px]">Arrival: {stop.arrivalTime}</p>
        ) : null}
        {stop.description ? <p className="text-muted-foreground mt-1 text-[11px]">{stop.description}</p> : null}
      </MarkerPopup>
    </MapMarker>
  );
});
