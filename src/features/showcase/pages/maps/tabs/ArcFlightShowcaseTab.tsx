import { LazyArcFlightMap } from "@/components/map";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_FLIGHT_ARCS } from "../constants";
import type { DemoStateProps } from "../types";

export function ArcFlightShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
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
          title: "全国航空与城际干线拓扑网络",
          description: "大圆贝塞尔弯曲飞线、枢纽端点脉冲光晕与航段流量浮层",
        }}
      />
    </TabsContent>
  );
}
