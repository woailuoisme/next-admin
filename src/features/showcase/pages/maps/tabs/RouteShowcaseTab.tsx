import { LazyRouteTrackingMap } from "@/components/map";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_ROUTE_COORDS, MOCK_ROUTE_STOPS } from "../constants";
import type { DemoStateProps } from "../types";

export function RouteShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
  return (
    <TabsContent value="route" className="space-y-4">
      <LazyRouteTrackingMap
        coordinates={MOCK_ROUTE_COORDS}
        stops={MOCK_ROUTE_STOPS}
        vehicle={{
          id: "v-01",
          name: "Heavy Freight EV-800",
          licensePlate: "京A·88888",
          speed: 76,
          statusText: "On-schedule delivery",
        }}
        defaultProgress={0.48}
        autoPlay={false}
        playbackDuration={20}
        showScrubber={true}
        height={500}
        center={[118.5, 35.5]}
        zoom={5.5}
        isLoading={isLoading}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        cardProps={{
          title: "京沪干线重卡冷链物流监控",
          description: "载具沿线动态脉冲指示、里程进度滑条与沿途枢纽站点状态联动",
        }}
      />
    </TabsContent>
  );
}
