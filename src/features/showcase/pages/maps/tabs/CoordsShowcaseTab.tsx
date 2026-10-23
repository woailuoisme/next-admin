"use client";

import { useState } from "react";
import { BASEMAP_OPTIONS, type BasemapStyleKey, type CoordinateSystem, LazyLocationMarkerMap } from "@/components/map";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_LOCATIONS } from "../constants";

const COORD_SYSTEMS: readonly CoordinateSystem[] = ["WGS84", "GCJ02", "BD09"] as const;

export function CoordsShowcaseTab() {
  const [activeBasemap, setActiveBasemap] = useState<BasemapStyleKey>("carto");
  const [activeCoordSys, setActiveCoordSys] = useState<CoordinateSystem>("WGS84");

  return (
    <TabsContent value="coords" className="space-y-4">
      <div className="border-border/70 bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-foreground text-xs font-semibold">零依赖双轨坐标系转换 (WGS-84 ⇋ GCJ-02 ⇋ BD-09)</div>
          <div className="text-muted-foreground text-[11px]">
            支持高德地图瓦片、天地图国家公共服务平台与国际标准底图的无缝切换与高精度纠偏
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">数据坐标系:</span>
            <div className="border-border flex rounded-md border p-0.5">
              {COORD_SYSTEMS.map((cs) => (
                <Button
                  key={cs}
                  variant={activeCoordSys === cs ? "default" : "ghost"}
                  size="xs"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setActiveCoordSys(cs)}
                >
                  {cs}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">底图服务:</span>
            <div className="border-border flex rounded-md border p-0.5">
              {BASEMAP_OPTIONS.map((bm) => (
                <Button
                  key={bm.value}
                  variant={activeBasemap === bm.value ? "default" : "ghost"}
                  size="xs"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setActiveBasemap(bm.value)}
                >
                  {bm.label.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LazyLocationMarkerMap
        locations={MOCK_LOCATIONS}
        coordinateSystem={activeCoordSys}
        basemap={activeBasemap}
        height={500}
        center={[116.4, 39.9]}
        zoom={10}
        showSearch={true}
        showSidebarList={false}
        cardProps={{
          title: `双轨坐标纠偏验证 (输入: ${activeCoordSys} | 底图: ${activeBasemap})`,
          description: "坐标变换引擎自动将输入纠偏至目标底图标准，保证标点在卫星、道路和高德地图上的绝对精准贴合",
        }}
      />
    </TabsContent>
  );
}
