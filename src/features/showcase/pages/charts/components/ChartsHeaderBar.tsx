import { BarChart3, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_STATES, DEMO_STATE_LABELS } from "../constants";
import type { DemoState } from "../types";

interface ChartsHeaderBarProps {
  demoState: DemoState;
  onDemoStateChange: (state: DemoState) => void;
  onRefresh: () => void;
}

export function ChartsHeaderBar({ demoState, onDemoStateChange, onRefresh }: ChartsHeaderBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">图表组件库 / Chart Library</h1>
          <Badge variant="secondary" className="font-mono text-xs">
            src/components/chart
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          对标企业级监控仪表盘的高性能、响应式、模块化设计系统图表套件，内置 8
          大图表类型、响应式容器及完备的状态反馈。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="bg-muted/60 flex items-center gap-1.5 rounded-md border p-1 text-xs">
          <span className="text-muted-foreground px-1.5 font-medium">演示状态:</span>
          {DEMO_STATES.map((state) => (
            <Button
              key={state}
              variant={demoState === state ? "secondary" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onDemoStateChange(state)}
            >
              {DEMO_STATE_LABELS[state]}
            </Button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          刷新渲染
        </Button>
      </div>
    </div>
  );
}
