import { useState } from "react";
import { LocationMarkerMap } from "@/components/map";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_DENSE_LOCATIONS } from "../constants";
import type { DemoStateProps } from "../types";

const BIG_DATA_MODES: readonly ("auto" | "dom" | "canvas")[] = ["auto", "dom", "canvas"];

export function BigDataShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
  const [bigDataRenderMode, setBigDataRenderMode] = useState<"auto" | "dom" | "canvas">("auto");

  return (
    <TabsContent value="bigdata" className="space-y-4">
      <div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="text-foreground text-xs font-semibold">
            自适应降级模式控制 (Auto-Tiering Engine)
          </div>
          <div className="text-muted-foreground text-[11px]">
            当前加载 320 个真实节点：阈值 200。可在 Auto（自动降级为 GPU WebGL）、DOM 与 Canvas 之间强制切换
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {BIG_DATA_MODES.map((mode) => (
            <Button
              key={mode}
              variant={bigDataRenderMode === mode ? "default" : "outline"}
              size="xs"
              className="text-xs uppercase"
              onClick={() => setBigDataRenderMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      <LocationMarkerMap
        locations={MOCK_DENSE_LOCATIONS}
        renderMode={bigDataRenderMode}
        tierThreshold={200}
        height={520}
        center={[121.47, 31.23]}
        zoom={11.5}
        showSearch={true}
        showCategoryFilter={true}
        showSidebarList={true}
        isLoading={isLoading}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        cardProps={{
          title: "超大容量自适应降级感知渲染 (320+ 点)",
          description:
            "自动触发 GPU WebGL 矢量聚合图层，点击集群自动展开；选中点自动晋升为交互式 DOM 脉冲标点",
        }}
      />
    </TabsContent>
  );
}
