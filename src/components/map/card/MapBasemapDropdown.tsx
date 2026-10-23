import { useTranslations } from "next-intl";
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
import type { MessageKeyOf } from "@/types/i18n";

interface MapBasemapDropdownProps {
  basemap: BasemapStyleKey;
  onBasemapChange: (basemap: BasemapStyleKey) => void;
}

const BASEMAP_I18N_KEYS: Record<BasemapStyleKey, { labelKey: MessageKeyOf<"map">; descKey: MessageKeyOf<"map"> }> = {
  carto: { labelKey: "basemap_carto", descKey: "basemap_carto_desc" },
  osm: { labelKey: "basemap_osm", descKey: "basemap_osm_desc" },
  amap: { labelKey: "basemap_amap", descKey: "basemap_amap_desc" },
  tianditu: { labelKey: "basemap_tianditu", descKey: "basemap_tianditu_desc" },
  blank: { labelKey: "basemap_blank", descKey: "basemap_blank_desc" },
};

export const MapBasemapDropdown = memo(function MapBasemapDropdown({
  basemap,
  onBasemapChange,
}: MapBasemapDropdownProps) {
  const t = useTranslations("map");

  const activeOpt = BASEMAP_OPTIONS.find((b) => b.value === basemap);
  const activeBasemapLabel = activeOpt
    ? activeOpt.value in BASEMAP_I18N_KEYS
      ? t(BASEMAP_I18N_KEYS[activeOpt.value].labelKey)
      : activeOpt.label
    : t("basemap_carto");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
          title={t("basemap_selector")}
          aria-label={t("basemap_selector")}
        >
          <Layers className="size-3.5" />
          <span className="hidden md:inline">{activeBasemapLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {BASEMAP_OPTIONS.map((opt) => {
          const itemLabel = opt.value in BASEMAP_I18N_KEYS ? t(BASEMAP_I18N_KEYS[opt.value].labelKey) : opt.label;
          const itemDesc = opt.value in BASEMAP_I18N_KEYS ? t(BASEMAP_I18N_KEYS[opt.value].descKey) : opt.description;

          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onBasemapChange(opt.value)}
              className={cn(
                "flex flex-col items-start gap-0.5 text-xs",
                basemap === opt.value && "font-semibold text-primary",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span>{itemLabel}</span>
                {basemap === opt.value ? <span className="bg-primary size-1.5 rounded-full" /> : null}
              </div>
              {itemDesc ? <span className="text-muted-foreground text-[10px] font-normal">{itemDesc}</span> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
