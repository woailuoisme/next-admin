import { GlobalWindow } from "happy-dom";

import { installConsoleNoiseFilter } from "./console-noise-filter";

// 1. 初始化 Happy DOM 虚拟浏览器环境
const testOrigin = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
const win = new GlobalWindow({ url: testOrigin });

globalThis.window = win as unknown as Window & typeof globalThis;
globalThis.document = win.document as unknown as Document;
if (!("compatMode" in win.document)) {
  Object.defineProperty(win.document, "compatMode", { value: "CSS1Compat", configurable: true });
}
globalThis.navigator = win.navigator as unknown as Navigator;
globalThis.location = win.location as unknown as Location;
globalThis.history = win.history as unknown as History;

// 2. 将 Window 的类与属性注册到 globalThis 上
// 注意：保留 Bun 原生 Fetch / Streams / Abort 运行时类，避免 Bun native fetch 与 Happy DOM 的 AbortSignal 冲突
const ignoreList = new Set([
  "undefined",
  "NaN",
  "Infinity",
  "_wrapHandle",
  "process",
  "Buffer",
  "global",
  "globalThis",
  "AbortController",
  "AbortSignal",
  "fetch",
  "Request",
  "Response",
  "Headers",
  "FormData",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "Blob",
  "File",
  "URL",
  "URLSearchParams",
]);

const targetGlobal = globalThis as unknown as Record<string, unknown>;
const winDict = win as unknown as Record<string, unknown>;

// 2.1 强制覆盖 DOM 构造函数 / Classes（避免 Bun 原生 Event/CustomEvent 与 Happy DOM 冲突）
for (const key of Object.getOwnPropertyNames(win)) {
  if (!ignoreList.has(key)) {
    try {
      const val = winDict[key];
      if (typeof val === "function" && /^[A-Z]/.test(key)) {
        targetGlobal[key] = val;
      }
    } catch {}
  }
}

// 2.2 注册剩余属性与原型方法
for (const key of Object.getOwnPropertyNames(win)) {
  if (!ignoreList.has(key) && !(key in globalThis)) {
    try {
      const desc = Object.getOwnPropertyDescriptor(win, key);
      if (desc) {
        Object.defineProperty(globalThis, key, desc);
      }
    } catch {}
  }
}

let proto = Object.getPrototypeOf(win);
while (proto && proto !== Object.prototype) {
  const protoDict = proto as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (!ignoreList.has(key)) {
      try {
        const val = protoDict[key];
        if (typeof val === "function" && /^[A-Z]/.test(key)) {
          targetGlobal[key] = val;
        } else if (!(key in globalThis)) {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc?.get) {
            Object.defineProperty(globalThis, key, {
              get: () => winDict[key],
              configurable: true,
            });
          } else if (typeof val === "function") {
            targetGlobal[key] = val.bind(win);
          } else {
            targetGlobal[key] = val;
          }
        }
      } catch {}
    }
  }
  proto = Object.getPrototypeOf(proto);
}

// 3. 垫片
for (const rafKey of ["requestAnimationFrame", "cancelAnimationFrame"] as const) {
  Object.defineProperty(globalThis, rafKey, {
    get: () => winDict[rafKey],
    set: (v: unknown) => {
      winDict[rafKey] = v;
    },
    configurable: true,
  });
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (!globalThis.ResizeObserver) {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

if (!globalThis.IntersectionObserver) {
  class MockIntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "blob:mock-url";
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = () => {};
}

// 4. 过滤已知测试环境噪音输出
installConsoleNoiseFilter();
