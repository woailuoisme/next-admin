import { useState } from "react";
import { useTranslations } from "next-intl";
import { LazyGeoHeatmapMap } from "@/components/map/lazy";
import type { HeatmapColorRamp } from "@/components/map/heatmap/types";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_HEATMAP_POINTS } from "../constants";
import type { DemoStateProps } from "../types";

const HEATMAP_RAMPS: readonly HeatmapColorRamp[] = ["thermal", "viridis", "spectral", "plasma", "mono"];

export function HeatmapShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
  const t = useTranslations("showcase");
  const [heatmapRamp, setHeatmapRamp] = useState<HeatmapColorRamp>("thermal");

  return (
    <TabsContent value="heatmap" className="space-y-4">
      <div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="text-foreground text-xs font-semibold">{t("maps_heatmap_control_title")}</div>
          <div className="text-muted-foreground text-[11px]">{t("maps_heatmap_control_desc")}</div>
        </div>
        <div className="flex items-center gap-1.5">
          {HEATMAP_RAMPS.map((ramp) => (
            <Button
              key={ramp}
              variant={heatmapRamp === ramp ? "default" : "outline"}
              size="xs"
              className="text-xs capitalize"
              onClick={() => setHeatmapRamp(ramp)}
            >
              {ramp}
            </Button>
          ))}
        </div>
      </div>

      <LazyGeoHeatmapMap
        data={MOCK_HEATMAP_POINTS}
        colorRamp={heatmapRamp}
        radius={32}
        maxIntensity={1}
        center={[116.5, 31.5]}
        zoom={4.6}
        height={500}
        isLoading={isLoading}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        cardProps={{
          title: t("maps_heatmap_card_title"),
          description: t("maps_heatmap_card_desc"),
        }}
      />
    </TabsContent>
  );
}
