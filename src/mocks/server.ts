import { FetchInterceptor as WebFetchInterceptor } from "@mswjs/interceptors/fetch/web";
import { WebSocketInterceptor } from "@mswjs/interceptors/WebSocket";
import { defaultNetworkOptions, setupServer } from "msw/node";

import { handlers } from "./handlers";

// Bun 原生 fetch 不走 node:net 套接字，MSW 3 默认的 Node FetchInterceptor 会被绕过。
// 在 Bun 运行时下使用 web FetchInterceptor 拦截 globalThis.fetch
const isBun = typeof (globalThis as Record<string, unknown>).Bun !== "undefined" || Boolean(process.versions?.bun);
if (isBun && defaultNetworkOptions.sources[0]) {
  const InterceptorSource = defaultNetworkOptions.sources[0].constructor as new (options: unknown) => unknown;
  defaultNetworkOptions.sources = [
    new InterceptorSource({
      interceptors: [new WebFetchInterceptor(), new WebSocketInterceptor()],
    }),
  ] as unknown as typeof defaultNetworkOptions.sources;
}

export const server = setupServer(...handlers);
