"use client";

import { RootErrorComponent } from "@/components/layout/RootErrorComponent";

/** 页面级错误边界：只替换内容区，保留侧边栏与顶部导航 */
export default function AppGroupError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RootErrorComponent error={error} reset={reset} />;
}
