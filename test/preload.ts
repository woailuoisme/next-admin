import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, expect as bunExpect, mock } from "bun:test";
import { expect as vitestExpect, vi } from "vitest";

// 0. 兼容 Bun 下 vitest shim 缺少 vi.hoisted 的情况
if (typeof vi !== "undefined" && !vi.hoisted) {
  (vi as unknown as Record<string, unknown>).hoisted = (factory: () => unknown) => factory();
}

// 1. 注入 @testing-library/jest-dom 匹配器至 bun:test 和 vitest expect
bunExpect.extend(matchers);
try {
  vitestExpect.extend(matchers);
} catch {}

// 2. 每个测试后自动清理 DOM 树并重置 location
afterEach(() => {
  cleanup();
  if (typeof window !== "undefined" && window.location.href.startsWith("blob:")) {
    window.location.href = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
  }
});

// 3. Mock Next.js Navigation (Bun 原生模块级别 Mock)
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  }),
  usePathname: () => "/overview",
  useSearchParams: () => new URLSearchParams(),
  redirect: () => {},
}));

// 4. 统一 MSW 网络拦截生命周期
try {
  const { server } = await import("@/mocks/server");
  server.listen({ onUnhandledFrame: "bypass" });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });
} catch (e) {
  console.error("MSW SERVER SETUP FAILED:", e);
}
