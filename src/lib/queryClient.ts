import { defaultShouldDehydrateQuery, isServer, QueryClient } from "@tanstack/react-query";
import { cache } from "react";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query),
      },
    },
  });
}

const getServerQueryClient = cache(makeQueryClient);
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: reuse a single QueryClient per request via React cache to prevent both cross-request leaks and double-creation
    return getServerQueryClient();
  }
  // Browser: initialize singleton once and reuse
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function getActiveQueryClient(): QueryClient {
  return getQueryClient();
}

export function setGlobalQueryClient(client: QueryClient): void {
  browserQueryClient = client;
}

export async function clearQueryCache(): Promise<void> {
  if (browserQueryClient) {
    browserQueryClient.clear();
  }
}

/**
 * 服务端安全预取：带超时熔断保护，防止后端异常或构建期网络挂起阻塞 SSR/Build
 */
export async function prefetchWithTimeout(prefetchPromise: Promise<unknown>, timeoutMs = 3000): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  try {
    await Promise.race([prefetchPromise, timeoutPromise]);
  } catch {
    // 降级：异常或超时自动静默放弃预取，交由客户端渲染时兜底拉取
  } finally {
    if (timer) clearTimeout(timer);
  }
}
