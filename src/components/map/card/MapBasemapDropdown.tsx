import { Layers } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { BasemapStyleKey } from "../presets/basemaps";

import { BASEMAP_OPTIONS } from "../presets/basemaps";

interface MapBasemapDropdownProps {
  basemap: BasemapStyleKey;
  onBasemapChange: (basemap: BasemapStyleKey) => void;
}

export const MapBasemapDropdown = memo(function MapBasemapDropdown({
  basemap,
  onBasemapChange,
}: MapBasemapDropdownProps) {
  const activeBasemapLabel = BASEMAP_OPTIONS.find((b) => b.value === basemap)?.label ?? "标准矢量底图";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
          title="切换底图风格"
          aria-label="切换底图风格"
        >
          <Layers className="size-3.5" />
          <span className="hidden md:inline">{activeBasemapLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {BASEMAP_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onBasemapChange(opt.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 text-xs",
              basemap === opt.value && "font-semibold text-primary",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span>{opt.label}</span>
              {basemap === opt.value ? <span className="bg-primary size-1.5 rounded-full" /> : null}
            </div>
            {opt.description ? (
              <span className="text-muted-foreground text-[10px] font-normal">{opt.description}</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
