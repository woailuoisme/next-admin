import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, expect as bunExpect, mock } from "bun:test";
import { expect as vitestExpect, vi } from "vitest";

// 0. 兼容 Bun 下 vitest shim 缺少 vi.hoisted / vi.stubGlobal 的情况
if (typeof vi !== "undefined") {
  const viRecord = vi as unknown as Record<string, unknown>;
  if (!viRecord.hoisted) {
    viRecord.hoisted = (factory: () => unknown) => factory();
  }
  if (!viRecord.stubGlobal) {
    const stubbedGlobals = new Map<string, { existed: boolean; descriptor?: PropertyDescriptor }>();
    viRecord.stubGlobal = (name: string, value: unknown) => {
      if (!stubbedGlobals.has(name)) {
        const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
        stubbedGlobals.set(name, { existed: descriptor !== undefined, descriptor });
      }
      Object.defineProperty(globalThis, name, {
        value,
        writable: true,
        configurable: true,
      });
      return vi;
    };
    viRecord.unstubAllGlobals = () => {
      for (const [name, original] of stubbedGlobals) {
        if (original.existed && original.descriptor) {
          Object.defineProperty(globalThis, name, original.descriptor);
        } else {
          delete (globalThis as Record<string, unknown>)[name];
        }
      }
      stubbedGlobals.clear();
      return vi;
    };
  }
}

// 1. 注入 @testing-library/jest-dom 匹配器至 bun:test 和 vitest expect
bunExpect.extend(matchers);
try {
  vitestExpect.extend(matchers);
} catch {}

// 2. 每个测试后自动清理 DOM 树、恢复 stubbed globals 并重置 location
afterEach(() => {
  cleanup();
  if (typeof vi !== "undefined" && typeof (vi as unknown as Record<string, unknown>).unstubAllGlobals === "function") {
    (vi as unknown as { unstubAllGlobals: () => void }).unstubAllGlobals();
  }
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
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
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
