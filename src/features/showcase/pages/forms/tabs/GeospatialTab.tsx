"use client";

import { useState } from "react";

import { type BasemapPreset, type CoordinateSystem, FormLocationPicker, FormSection } from "@/components/form";
import { cn } from "@/lib/utils";

import { BASEMAP_SELECT_OPTIONS, COORDINATE_SYSTEM_OPTIONS } from "../constants";

export interface GeospatialTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function GeospatialTab({ form }: GeospatialTabProps) {
  // Geospatial configuration state for the interactive demo (self-contained)
  const [activeBasemap, setActiveBasemap] = useState<BasemapPreset>("amap");
  const [activeCRS, setActiveCRS] = useState<CoordinateSystem>("WGS84");
  const [showSearch, setShowSearch] = useState(true);
  const [showCoordsInput, setShowCoordsInput] = useState(true);
  const [isLocationDisabled, setIsLocationDisabled] = useState(false);

  return (
    <div className="space-y-6">
      <FormSection
        title="Interactive Map Location Picker (FormLocationPicker)"
        description="Full-featured geographic coordinate picker built on MapLibre GL with integrated reverse geocoding, address search, coordinate system transformation, and quick presets."
      >
        <div className="space-y-4">
          <FormLocationPicker
            form={form}
            name="officeLocation"
            label="Headquarters Campus (FormLocationPicker)"
            helperText="Interactive vector map with quick city preset chips, one-click coordinate copy, reverse geocoding on drag end, and TanStack Form state synchronization."
            required
            height={340}
            zoom={13}
            showAddressSearch
            showCoordinatesInput
            showCopyButton
          />
        </div>
      </FormSection>

      <FormSection
        title="Custom Basemaps, Projections & Multi-CRS Configuration"
        description="Switch between coordinate systems (WGS84, GCJ02, BD09), basemap providers (Amap, Carto, OpenStreetMap, Tianditu), and toggle manual controls dynamically."
      >
        <div className="space-y-4">
          <div className="border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs font-medium">底图预设:</span>
                <div className="flex items-center gap-1">
                  {BASEMAP_SELECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setActiveBasemap(opt.value)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                        activeBasemap === opt.value
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs font-medium">坐标系:</span>
                <div className="flex items-center gap-1">
                  {COORDINATE_SYSTEM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setActiveCRS(opt.value)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                        activeCRS === opt.value
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showSearch}
                  onChange={(e) => setShowSearch(e.target.checked)}
                  className="accent-primary size-3.5 rounded"
                />
                <span>地址搜索</span>
              </label>
              <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showCoordsInput}
                  onChange={(e) => setShowCoordsInput(e.target.checked)}
                  className="accent-primary size-3.5 rounded"
                />
                <span>经纬度微调栏</span>
              </label>
              <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={isLocationDisabled}
                  onChange={(e) => setIsLocationDisabled(e.target.checked)}
                  className="accent-primary size-3.5 rounded"
                />
                <span>禁用表单控件</span>
              </label>
            </div>
          </div>

          <FormLocationPicker
            form={form}
            name="warehouseLocation"
            label={`Regional Logistics Hub (Basemap: ${activeBasemap}, CRS: ${activeCRS})`}
            helperText="Dynamically updates basemap tiles and CRS math according to interactive controls above."
            basemap={activeBasemap}
            coordinateSystem={activeCRS}
            height={280}
            zoom={11}
            showAddressSearch={showSearch}
            showCoordinatesInput={showCoordsInput}
            disabled={isLocationDisabled}
            searchPlaceholder="搜索物流仓库、中转站或地标地址..."
          />
        </div>
      </FormSection>
    </div>
  );
}
