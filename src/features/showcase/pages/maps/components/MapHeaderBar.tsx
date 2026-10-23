import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DemoState } from "../types";

interface MapHeaderBarProps {
  demoState: DemoState;
  onDemoStateChange: (state: DemoState) => void;
  onReset: () => void;
}

const DEMO_STATES: readonly DemoState[] = ["normal", "loading", "empty", "error"] as const;

export function MapHeaderBar({ demoState, onDemoStateChange, onReset }: MapHeaderBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">Map Components Showcase</h1>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            @mapcn/map 封装
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          企业级高阶地图套件：网点聚合分布、车辆轨迹回放、行政区划热力着色、拓扑飞线与表单坐标拾取器
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="border-border bg-card flex items-center rounded-lg border p-0.5 text-xs">
          {DEMO_STATES.map((st) => (
            <Button
              key={st}
              variant={demoState === st ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs capitalize"
              onClick={() => onDemoStateChange(st)}
            >
              {st}
            </Button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onReset}>
          <RefreshCw className="size-3.5" />
          Reset State
        </Button>
      </div>
    </div>
  );
}
