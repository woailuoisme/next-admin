import { useSyncExternalStore } from "react";

export const subscribeNoop = () => () => {};

/**
 * 判断客户端组件是否已完成 hydration（SSR 与首帧 hydration 返回 false，客户端挂载后返回 true）。
 * 避免在 SSR/CSR 间因读取浏览器存储产生 hydration mismatch，同时消除手写 useEffect + setMounted。
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
