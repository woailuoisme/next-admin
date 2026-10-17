import { LocationMarkerMap } from "@/components/map";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_LOCATIONS } from "../constants";

interface MarkersShowcaseTabProps {
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function MarkersShowcaseTab({ isLoading, isEmpty, isError, onRetry }: MarkersShowcaseTabProps) {
  return (
    <TabsContent value="markers" className="space-y-4">
      <LocationMarkerMap
        locations={MOCK_LOCATIONS}
        height={520}
        center={[114, 30]}
        zoom={4.5}
        showSearch={true}
        showCategoryFilter={true}
        showSidebarList={true}
        isLoading={isLoading}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        cardProps={{
          title: "全国自营仓储与旗舰网点分布",
          description: "支持品类徽章筛选、智能关键词检索、侧边网点卡片与平滑视口平移飞入",
        }}
      />
    </TabsContent>
  );
}
