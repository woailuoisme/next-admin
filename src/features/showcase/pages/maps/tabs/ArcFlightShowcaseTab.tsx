import { useTranslations } from "next-intl";
import { LazyArcFlightMap } from "@/components/map/lazy";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_FLIGHT_ARCS } from "../constants";
import type { DemoStateProps } from "../types";

export function ArcFlightShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
  const t = useTranslations("showcase");
  return (
    <TabsContent value="arc" className="space-y-4">
      <LazyArcFlightMap
        arcs={MOCK_FLIGHT_ARCS}
        curvature={0.25}
        arcWidth={2.5}
        showNodeMarkers={true}
        height={500}
        center={[114, 32]}
        zoom={4}
        isLoading={isLoading}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        cardProps={{
          title: t("maps_arc_card_title"),
          description: t("maps_arc_card_desc"),
        }}
      />
    </TabsContent>
  );
}
