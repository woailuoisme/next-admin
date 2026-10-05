import type { MapMouseEvent } from "maplibre-gl";

import { useEffect } from "react";

import { useMap } from "@/components/ui/map";

interface MapClickHandlerProps {
  onClick: (coords: { lng: number; lat: number }) => void;
  disabled?: boolean;
}

export function MapClickHandler({ onClick, disabled }: MapClickHandlerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || disabled) return;

    const handler = (e: MapMouseEvent) => {
      onClick({
        lng: Number(e.lngLat.lng.toFixed(6)),
        lat: Number(e.lngLat.lat.toFixed(6)),
      });
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, isLoaded, disabled, onClick]);

  return null;
}
