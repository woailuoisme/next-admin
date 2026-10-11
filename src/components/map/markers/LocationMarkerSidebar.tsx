import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { LocationMarkerItem } from "./types";

interface LocationMarkerSidebarProps {
  filteredData: LocationMarkerItem[];
  selectedMarker: LocationMarkerItem | null;
  onSelectMarker: (item: LocationMarkerItem | null) => void;
}

export const LocationMarkerSidebar = memo(function LocationMarkerSidebar({
  filteredData,
  selectedMarker,
  onSelectMarker,
}: LocationMarkerSidebarProps) {
  return (
    <div className="border-border/60 bg-card hidden w-72 flex-col border-l md:flex">
      <div className="border-border/40 text-foreground flex items-center justify-between border-b p-3 text-xs font-semibold">
        <span>网点列表 ({filteredData.length})</span>
        {selectedMarker ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-6 px-1.5 text-[11px]"
            onClick={() => onSelectMarker(null)}
          >
            取消选中
          </Button>
        ) : null}
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1.5">
          {filteredData.map((item) => {
            const isSelected = selectedMarker?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectMarker(item)}
                className={cn(
                  "flex w-full cursor-pointer flex-col gap-1 rounded-md border p-2.5 text-left text-xs transition-colors",
                  "[contain-intrinsic-size:auto_54px] [content-visibility:auto]",
                  isSelected
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-foreground line-clamp-1 font-medium">{item.title}</span>
                  {item.category ? (
                    <Badge variant="outline" className="px-1 py-0 text-[10px]">
                      {item.category}
                    </Badge>
                  ) : null}
                </div>
                {item.address ? (
                  <span className="text-muted-foreground line-clamp-1 text-[11px]">{item.address}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});
