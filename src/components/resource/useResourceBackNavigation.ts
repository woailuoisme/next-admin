import { useRouter } from "next/navigation";
import { useMemoizedFn } from "ahooks";

/**
 * 统一的资源页返回导航
 * 优先级：显式回调 → 路由路径跳转 → 浏览器历史回退
 */
export function useResourceBackNavigation(backTo?: string | (() => void)) {
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
