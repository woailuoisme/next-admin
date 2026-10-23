import { useState } from "react";
import { type HeatmapColorRamp, LazyGeoHeatmapMap } from "@/components/map";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_HEATMAP_POINTS } from "../constants";
import type { DemoStateProps } from "../types";

const HEATMAP_RAMPS: readonly HeatmapColorRamp[] = ["thermal", "viridis", "spectral", "plasma", "mono"];

export function HeatmapShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
  const [heatmapRamp, setHeatmapRamp] = useState<HeatmapColorRamp>("thermal");

  return (
    <TabsContent value="heatmap" className="space-y-4">
      <div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="text-foreground text-xs font-semibold">GPU KDE 核密度渐变色板</div>
          <div className="text-muted-foreground text-[11px]">
            高精度 WebGL 原生核密度估计，支持微秒级色板与权重插值平滑切换
          </div>
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
          title: "全国业务密度核密度热力 (GPU KDE)",
          description: "MapLibre GL 原生 WebGL 热力图层，实时核密度估计与动态密度图例",
        }}
      />
    </TabsContent>
  );
}
