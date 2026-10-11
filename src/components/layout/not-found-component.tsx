"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { progress } from "@/lib/progress";

/**
 * 全局统一 404 / 资源不存在组件 (NotFoundComponent)
 * 当 Next.js 遇到无法匹配的路由或显示抛出 notFound() 时触发
 */
export function NotFoundComponent() {
  // 404 页面触发时重置路由加载进度条，避免处于加载假死状态
  useEffect(() => {
    progress.reset();
  }, []);

  return (
    <div
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="bg-muted/60 text-muted-foreground mb-4 flex size-16 items-center justify-center rounded-full shadow-xs">
        <FileQuestion aria-hidden="true" className="size-8" />
      </div>
      <span className="text-primary mb-1 text-sm font-semibold tracking-wider uppercase">404 Not Found</span>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">页面未找到 (Page Not Found)</h1>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">
        抱歉，您访问的页面不存在、已被移动或暂时无法访问。
        <br />
        The requested page could not be found or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
          className="cursor-pointer gap-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          返回上一页 (Go Back)
        </Button>
        <Button asChild className="cursor-pointer gap-2">
          <Link href="/">
            <Home aria-hidden="true" className="size-4" />
            返回首页 (Back to Home)
          </Link>
        </Button>
      </div>
    </div>
  );
}
