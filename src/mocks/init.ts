import { env } from "@/env";

declare global {
  interface Window {
    __mswInitPromise?: Promise<void>;
  }
}

async function startWorker(): Promise<void> {
  const { getWorker } = await import("./browser");
  const worker = await getWorker();
  await worker?.start({
    onUnhandledFrame: "bypass",
    quiet: true,
  });
}

export function enableMocking(): Promise<void> {
  if (typeof window === "undefined" || !env.ENABLE_MOCK) {
    return Promise.resolve();
  }

  if (!window.__mswInitPromise) {
    window.__mswInitPromise = startWorker().catch((error: unknown) => {
      // 启动失败后清除缓存，使下次调用可以重试
      delete window.__mswInitPromise;
      throw error;
    });
  }

  return window.__mswInitPromise;
}
