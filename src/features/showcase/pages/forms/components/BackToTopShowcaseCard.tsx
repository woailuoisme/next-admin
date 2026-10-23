"use client";

import { useMemoizedFn } from "ahooks";
import { useRef, useState } from "react";

import { BackToTop } from "@/components/shared/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LOCAL_SCROLL_ITEMS } from "../constants";

export function BackToTopShowcaseCard() {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [showProgress, setShowProgress] = useState(true);

  // 稳定引用：避免 BackToTop 内部的事件监听在每次渲染时重新订阅
  const getLocalScrollTarget = useMemoizedFn(() => localContainerRef.current);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">BackToTop 返回顶部组件交互体验</CardTitle>
            <CardDescription className="text-xs">
              支持全屏主窗口与局部可滚动容器双重场景，具备 SVG 动态进度环与平滑回滚。
            </CardDescription>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs select-none">
            <span className="text-muted-foreground">显示环形进度条</span>
            <input
              type="checkbox"
              checked={showProgress}
              onChange={(e) => setShowProgress(e.target.checked)}
              className="accent-primary size-4 cursor-pointer rounded"
            />
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="bg-muted/40 text-muted-foreground rounded-md p-2.5">
          💡 <strong>全局模式提示</strong>：向下滚动当前表单页面超过
          300px，页面右下角将自动浮现带有实时滚动进度环的全局返回顶部按钮。
        </p>
        <div className="relative">
          <div className="text-foreground/80 mb-2 font-medium">
            局部容器模式演示（设置了 <code>threshold=60</code> 并绑定局部容器）：
          </div>
          <div
            ref={localContainerRef}
            className="border-border/70 bg-muted/20 relative h-44 space-y-3 overflow-y-auto rounded-lg border p-4"
          >
            {LOCAL_SCROLL_ITEMS.map((item) => (
              <div key={item.id} className="border-border/50 bg-background/80 rounded-md border p-3 shadow-xs">
                <span className="text-primary font-semibold">{item.title}</span>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  这里是局部可滚动容器内容。在长列表、聊天消息流或抽屉弹窗中，通过{" "}
                  <code>target=&#123;() =&gt; containerRef.current&#125;</code> 即可让 BackToTop
                  组件精准监听并回滚至该容器顶部。
                </p>
              </div>
            ))}
            <BackToTop
              target={getLocalScrollTarget}
              threshold={60}
              showProgress={showProgress}
              className="absolute right-4 bottom-4"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
