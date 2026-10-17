import { MapPin, Navigation, Network, PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MapFeatureHighlights() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
          <MapPin className="size-4" />
        </div>
        <div className="text-xs">
          <div className="text-foreground font-semibold">网点检索与联动</div>
          <div className="text-muted-foreground">品类过滤、列表联动与平滑飞入</div>
        </div>
      </Card>

      <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
          <Navigation className="size-4" />
        </div>
        <div className="text-xs">
          <div className="text-foreground font-semibold">物流沿线与进度滑块</div>
          <div className="text-muted-foreground">轨迹插值、站点状态与自动回放</div>
        </div>
      </Card>

      <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
          <PieChart className="size-4" />
        </div>
        <div className="text-xs">
          <div className="text-foreground font-semibold">分级着色 Choropleth</div>
          <div className="text-muted-foreground">数值色阶图例与悬浮气泡卡片</div>
        </div>
      </Card>

      <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
          <Network className="size-4" />
        </div>
        <div className="text-xs">
          <div className="text-foreground font-semibold">干线拓扑与表单拾取</div>
          <div className="text-muted-foreground">大圆贝塞尔飞线与经纬度拾取器</div>
        </div>
      </Card>
    </div>
  );
}
