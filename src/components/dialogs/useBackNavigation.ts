"use client";

import { useRouter } from "next/navigation";
import { useMemoizedFn } from "ahooks";

/**
 * 统一页面返回导航：显式回调 → 路由路径跳转 → 浏览器历史回退
 */
export function useBackNavigation(backTo?: string | (() => void)) {
  const router = useRouter();

  return useMemoizedFn(() => {
    if (typeof backTo === "function") {
      backTo();
    } else if (typeof backTo === "string") {
      router.push(backTo);
    } else {
      router.back();
    }
  });
}
