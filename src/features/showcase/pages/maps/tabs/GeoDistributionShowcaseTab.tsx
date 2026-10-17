import { GeoDistributionMap } from "@/components/map";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_GEOJSON_DATA } from "../constants";

interface GeoDistributionShowcaseTabProps {
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function GeoDistributionShowcaseTab({
  isLoading,
  isEmpty,
  isError,
  onRetry,
}: GeoDistributionShowcaseTabProps) {
  return (
    <TabsContent value="geo" className="space-y-4">
      <GeoDistributionMap
        data={MOCK_GEOJSON_DATA}
        valueKey="value"
        labelKey="name"
        unit="万元"
        colorScheme="primary"
        legendTitle="区域销售总额分级 (万元)"
        height={500}
        center={[114, 31]}
        zoom={4}
        isLoading={isLoading}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        cardProps={{
          title: "省区商业体量密度分级 (Choropleth)",
          description: "GeoJSON 几何渲染、5级离散色阶图例与鼠标悬浮区域卡片",
        }}
      />
    </TabsContent>
  );
}
