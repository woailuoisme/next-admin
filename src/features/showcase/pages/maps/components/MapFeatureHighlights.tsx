import { MapPin, Navigation, Network, PieChart } from "lucide-react";

import { Card } from "@/components/ui/card";

const MAP_HIGHLIGHTS = [
  { icon: MapPin, title: "网点检索与联动", description: "品类过滤、列表联动与平滑飞入" },
  { icon: Navigation, title: "物流沿线与进度滑块", description: "轨迹插值、站点状态与自动回放" },
  { icon: PieChart, title: "分级着色 Choropleth", description: "数值色阶图例与悬浮气泡卡片" },
  { icon: Network, title: "干线拓扑与表单拾取", description: "大圆贝塞尔飞线与经纬度拾取器" },
];

export function MapFeatureHighlights() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {MAP_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
        <Card key={title} className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-4" />
          </div>
          <div className="text-xs">
            <div className="text-foreground font-semibold">{title}</div>
            <div className="text-muted-foreground">{description}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
