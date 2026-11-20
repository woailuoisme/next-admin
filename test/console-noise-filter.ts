/**
 * 过滤测试环境已知噪音：React 19 next-themes 水合警告、Radix Presence 异步卸载警告、Bun + MSW `_wrapHandle` 警告。
 * vitest（test/setup.ts）与 bun test（test/dom-environment.ts）共用。
 */
export function installConsoleNoiseFilter() {
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
}
