"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";
import { List } from "lucide-react";
import { memo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "cn";

import type { LocationMarkerItem } from "./types";

interface LocationMarkerSidebarProps {
  filteredData: LocationMarkerItem[];
  selectedMarker: LocationMarkerItem | null;
  onSelectMarker: (item: LocationMarkerItem | null) => void;
}

const ROW_ESTIMATE_PX = 64;

const VirtualMarkerList = memo(function VirtualMarkerList({
  filteredData,
  selectedMarker,
  onSelectMarker,
  onItemPicked,
}: LocationMarkerSidebarProps & { onItemPicked?: () => void }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto p-2">
      <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {virtualItems.map((virtualRow) => {
          const item = filteredData[virtualRow.index];
          if (!item) return null;
          const isSelected = selectedMarker?.id === item.id;
          return (
            <div
              key={item.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full pb-1.5"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectMarker(item);
                  onItemPicked?.();
                }}
                className={cn(
                  "flex w-full cursor-pointer flex-col gap-1 rounded-md border p-2.5 text-left text-xs transition-colors",
                  isSelected
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-foreground line-clamp-1 font-medium">{item.title}</span>
                  {item.category ? (
                    <Badge variant="outline" className="shrink-0 px-1 py-0 text-[10px]">
                      {item.category}
                    </Badge>
                  ) : null}
                </div>
                {item.address ? (
                  <span className="text-muted-foreground line-clamp-1 text-[11px]">{item.address}</span>
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export const LocationMarkerSidebar = memo(function LocationMarkerSidebar({
  filteredData,
  selectedMarker,
  onSelectMarker,
}: LocationMarkerSidebarProps) {
  const t = useTranslations("map");

  return (
    <aside
      aria-label={t("markers_list_title", { count: filteredData.length })}
      className="border-border/60 bg-card hidden w-72 shrink-0 flex-col border-l md:flex"
    >
      <div className="border-border/40 text-foreground flex items-center justify-between border-b p-3 text-xs font-semibold">
        <span>{t("markers_list_title", { count: filteredData.length })}</span>
        {selectedMarker ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-6 px-1.5 text-[11px]"
            onClick={() => onSelectMarker(null)}
          >
            {t("markers_cancel_selection")}
          </Button>
        ) : null}
      </div>

      <VirtualMarkerList filteredData={filteredData} selectedMarker={selectedMarker} onSelectMarker={onSelectMarker} />
    </aside>
  );
});

/** 移动端（< 768px）浮动网点抽屉触发器与 Sheet 列表 */
export const LocationMarkerMobileDrawer = memo(function LocationMarkerMobileDrawer({
  filteredData,
  selectedMarker,
  onSelectMarker,
}: LocationMarkerSidebarProps) {
  const t = useTranslations("map");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-border/70 bg-background/95 absolute bottom-3 left-3 z-10 h-8 gap-1.5 border text-xs shadow-md backdrop-blur-md md:hidden"
      >
        <List aria-hidden="true" className="size-3.5" />
        <span>{t("markers_list_title", { count: filteredData.length })}</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-80 flex-col p-0 sm:max-w-sm">
          <SheetHeader className="border-border/60 flex flex-row items-center justify-between border-b px-4 py-3 pr-12">
            <SheetTitle className="text-sm">{t("markers_list_title", { count: filteredData.length })}</SheetTitle>
            {selectedMarker ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  onSelectMarker(null);
                  setOpen(false);
                }}
              >
                {t("markers_cancel_selection")}
              </Button>
            ) : null}
          </SheetHeader>

          <VirtualMarkerList
            filteredData={filteredData}
            selectedMarker={selectedMarker}
            onSelectMarker={onSelectMarker}
            onItemPicked={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
});
