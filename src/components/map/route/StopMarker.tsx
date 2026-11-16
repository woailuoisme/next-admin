"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { type ComponentType, memo, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "cn";

import type { RouteStop, RouteStopStatus } from "./types";

interface StopMarkerProps {
  stop: RouteStop;
  onStopClick?: (stop: RouteStop) => void;
}

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
    marker: "bg-chart-2 text-primary-foreground",
    Icon: CheckCircle2,
    badge: "default",
  },
  current: {
    marker: "bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-2",
    Icon: Clock,
    iconExtra: "animate-pulse motion-reduce:animate-none",
    badge: "secondary",
  },
  pending: {
    marker: "bg-muted text-muted-foreground",
    Icon: MapPin,
    badge: "outline",
  },
};

export const StopMarker = memo(function StopMarker({ stop, onStopClick }: StopMarkerProps) {
  const t = useTranslations("map");
  const status = stop.status ?? "pending";
  const { marker, Icon, iconExtra, badge } = STOP_STATUS_STYLES[status];
  const handleClick = useCallback(() => {
    onStopClick?.(stop);
  }, [onStopClick, stop]);

  return (
    <MapMarker longitude={stop.coordinates[0]} latitude={stop.coordinates[1]} onClick={handleClick}>
      <MarkerContent>
        <button
          type="button"
          aria-label={stop.name}
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-background p-0 shadow-md transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            marker,
          )}
        >
          <Icon className={cn("size-3.5", iconExtra)} aria-hidden="true" />
        </button>
      </MarkerContent>
      <MarkerPopup className="w-48 p-2.5">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs leading-tight font-semibold">{stop.name}</h4>
          {stop.status ? (
            <Badge variant={badge} className="text-[10px] uppercase">
              {stop.status}
            </Badge>
          ) : null}
        </div>
        {stop.arrivalTime ? (
          <p className="text-muted-foreground mt-1 text-[11px]">
            {t("route_stop_arrival", { time: stop.arrivalTime })}
          </p>
        ) : null}
        {stop.description ? <p className="text-muted-foreground mt-1 text-[11px]">{stop.description}</p> : null}
      </MarkerPopup>
    </MapMarker>
  );
});
