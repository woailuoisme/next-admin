"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapFeatureHighlights } from "./components/MapFeatureHighlights";
import { MapHeaderBar } from "./components/MapHeaderBar";
import { MAP_TABS } from "./constants";
import { ArcFlightShowcaseTab } from "./tabs/ArcFlightShowcaseTab";
import { BigDataShowcaseTab } from "./tabs/BigDataShowcaseTab";
import { CoordsShowcaseTab } from "./tabs/CoordsShowcaseTab";
import { GeoDistributionShowcaseTab } from "./tabs/GeoDistributionShowcaseTab";
import { HeatmapShowcaseTab } from "./tabs/HeatmapShowcaseTab";
import { MarkersShowcaseTab } from "./tabs/MarkersShowcaseTab";
import { PickerShowcaseTab } from "./tabs/PickerShowcaseTab";
import { RouteShowcaseTab } from "./tabs/RouteShowcaseTab";
import type { DemoState } from "./types";

export function MapShowcasePage() {
  const [demoState, setDemoState] = useState<DemoState>("normal");

  const isLoading = demoState === "loading";
  const isEmpty = demoState === "empty";
  const isError = demoState === "error";

  const handleRetry = () => {
    setDemoState("normal");
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MapHeaderBar demoState={demoState} onDemoStateChange={setDemoState} onReset={handleRetry} />

      <MapFeatureHighlights />

      <Tabs defaultValue="markers" className="space-y-6">
        <TabsList className="bg-muted/60 grid h-auto! w-full grid-cols-2 gap-1 border p-1 md:grid-cols-4">
          {MAP_TABS.map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
            >
              <Icon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <MarkersShowcaseTab isLoading={isLoading} isEmpty={isEmpty} isError={isError} onRetry={handleRetry} />

        <RouteShowcaseTab isLoading={isLoading} isEmpty={isEmpty} isError={isError} onRetry={handleRetry} />

        <GeoDistributionShowcaseTab
          isLoading={isLoading}
          isEmpty={isEmpty}
          isError={isError}
          onRetry={handleRetry}
        />

        <ArcFlightShowcaseTab
          isLoading={isLoading}
          isEmpty={isEmpty}
          isError={isError}
          onRetry={handleRetry}
        />

        <HeatmapShowcaseTab isLoading={isLoading} isEmpty={isEmpty} isError={isError} onRetry={handleRetry} />

        <BigDataShowcaseTab isLoading={isLoading} isEmpty={isEmpty} isError={isError} onRetry={handleRetry} />

        <CoordsShowcaseTab />

        <PickerShowcaseTab />
      </Tabs>
    </div>
  );
}

export default MapShowcasePage;
