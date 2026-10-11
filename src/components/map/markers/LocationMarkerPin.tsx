import { MapPin } from "lucide-react";
import { memo } from "react";

import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { LocationMarkerItem } from "./types";

import { LocationMarkerPopup } from "./LocationMarkerPopup";

interface LocationMarkerPinProps {
  item: LocationMarkerItem;
  isSelected: boolean;
  onSelect: (item: LocationMarkerItem) => void;
  renderPopup?: (item: LocationMarkerItem) => React.ReactNode;
}

export const LocationMarkerPin = memo(function LocationMarkerPin({
  item,
  isSelected,
  onSelect,
  renderPopup,
}: LocationMarkerPinProps) {
  const pinColor = item.color || "var(--primary)";

  return (
    <MapMarker longitude={item.coordinates[0]} latitude={item.coordinates[1]} onClick={() => onSelect(item)}>
      <MarkerContent>
        <div
          className={cn(
            "group relative flex cursor-pointer items-center justify-center transition-all duration-300",
            isSelected ? "z-30 scale-125" : "z-10 hover:scale-110",
          )}
        >
          {/* Pulsing ring for selected marker */}
          {isSelected ? (
            <span
              className="absolute size-8 animate-ping rounded-full opacity-40"
              style={{ backgroundColor: pinColor }}
            />
          ) : null}

          <div
            className="border-background flex size-7 items-center justify-center rounded-full border-2 shadow-md"
            style={{ backgroundColor: pinColor }}
          >
            <MapPin className="text-primary-foreground size-3.5 stroke-[2.5]" />
          </div>

          {/* Subtle title chip on hover or selected */}
          <div
            className={cn(
              "absolute top-8 rounded-md border border-border/80 bg-background/95 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground shadow-sm backdrop-blur-xs transition-opacity",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            {item.title}
          </div>
        </div>
      </MarkerContent>

      {/*
				Interactive Popup Card
				容器默认 `max-w-62`(248px)，扣掉 p-3(24px) 与边框(2px) 后内容盒仅 222px，
				而 LocationMarkerPopup 的内容宽为 w-64(256px) → 会溢出容器边框。放宽到 288px
				刚好容纳（256 + 26 = 282px），同时仍对自定义 renderPopup 保留一个上限。
			*/}
      <MarkerPopup className="max-w-72">
        {renderPopup ? renderPopup(item) : <LocationMarkerPopup item={item} />}
      </MarkerPopup>
    </MapMarker>
  );
});
