"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { MapSkeleton } from "@/components/map";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapFeatureHighlights } from "./components/MapFeatureHighlights";
import { MapHeaderBar } from "./components/MapHeaderBar";
import { MAP_TABS } from "./constants";
import { MarkersShowcaseTab } from "./tabs/MarkersShowcaseTab";
import type { DemoState, DemoStateProps } from "./types";

const RouteShowcaseTab = dynamic(() => import("./tabs/RouteShowcaseTab").then((m) => m.RouteShowcaseTab), {
  loading: () => <MapSkeleton height={500} />,
});

const GeoDistributionShowcaseTab = dynamic(
  () => import("./tabs/GeoDistributionShowcaseTab").then((m) => m.GeoDistributionShowcaseTab),
  { loading: () => <MapSkeleton height={500} /> },
);

const ArcFlightShowcaseTab = dynamic(() => import("./tabs/ArcFlightShowcaseTab").then((m) => m.ArcFlightShowcaseTab), {
  loading: () => <MapSkeleton height={500} />,
});

const HeatmapShowcaseTab = dynamic(() => import("./tabs/HeatmapShowcaseTab").then((m) => m.HeatmapShowcaseTab), {
  loading: () => <MapSkeleton height={500} />,
});

const BigDataShowcaseTab = dynamic(() => import("./tabs/BigDataShowcaseTab").then((m) => m.BigDataShowcaseTab), {
  loading: () => <MapSkeleton height={500} />,
});

const CoordsShowcaseTab = dynamic(() => import("./tabs/CoordsShowcaseTab").then((m) => m.CoordsShowcaseTab), {
  loading: () => <MapSkeleton height={500} />,
});

const PickerShowcaseTab = dynamic(() => import("./tabs/PickerShowcaseTab").then((m) => m.PickerShowcaseTab), {
  loading: () => <MapSkeleton height={500} />,
});

export function MapShowcasePage() {
  const t = useTranslations("showcase");
  const [demoState, setDemoState] = useState<DemoState>("normal");

  const handleRetry = () => {
    setDemoState("normal");
  };

  const stateProps: DemoStateProps = {
    isLoading: demoState === "loading",
    isEmpty: demoState === "empty",
    isError: demoState === "error",
    onRetry: handleRetry,
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MapHeaderBar demoState={demoState} onDemoStateChange={setDemoState} onReset={handleRetry} />

      <MapFeatureHighlights />

      <Tabs defaultValue="markers" className="space-y-6">
        <TabsList className="bg-muted/60 grid h-auto! w-full grid-cols-2 gap-1 border p-1 md:grid-cols-4">
          {MAP_TABS.map(({ value, icon: Icon, labelKey }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
            >
              <Icon className="size-3.5" />
              {t(labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        <MarkersShowcaseTab {...stateProps} />

        <RouteShowcaseTab {...stateProps} />

        <GeoDistributionShowcaseTab {...stateProps} />

        <ArcFlightShowcaseTab {...stateProps} />

        <HeatmapShowcaseTab {...stateProps} />

        <BigDataShowcaseTab {...stateProps} />

        <CoordsShowcaseTab />

        <PickerShowcaseTab />
      </Tabs>
    </div>
  );
}

export default MapShowcasePage;
