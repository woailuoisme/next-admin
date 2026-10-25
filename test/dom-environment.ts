import { GlobalWindow } from "happy-dom";

// 1. 初始化 Happy DOM 虚拟浏览器环境
const testOrigin = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
const win = new GlobalWindow({ url: testOrigin });

globalThis.window = win as unknown as Window & typeof globalThis;
globalThis.document = win.document as unknown as Document;
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

// 4. 过滤已知测试环境噪音输出（React 19 next-themes 客户端渲染 script 警告、Radix Presence/LoadableComponent 异步卸载警告与 Bun 下 MSW _wrapHandle 兼容警告）
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const fullMessage = args.map((a) => (typeof a === "string" ? a : "")).join(" ");
  if (
    fullMessage.includes("Encountered a script tag") ||
    (fullMessage.includes("was not wrapped in act(...)") &&
      (fullMessage.includes("ForwardRef(LoadableComponent)") ||
        fullMessage.includes("Presence") ||
        fullMessage.includes("LoadableComponent")))
  ) {
    return;
  }
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes('Failed to replace a global value at "_wrapHandle"')) {
    return;
  }
  originalWarn.apply(console, args);
};
