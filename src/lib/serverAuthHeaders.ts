import { cookies, headers } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/features/auth/store";

import { setServerHeadersResolver } from "./apiClient";

let registered = false;

/**
 * 仅用于服务端渲染上下文：向 apiClient 注册请求级凭证透传解析器。
 * 利用 Next.js `cookies()` / `headers()` 的请求级 AsyncLocalStorage，确保并发请求间严格隔离。
 */
export function registerServerAuthHeaders(): void {
  if (registered) return;
  registered = true;

  setServerHeadersResolver(async () => {
    try {
      const [cookieStore, reqHeaders] = await Promise.all([cookies(), headers()]);
      const forwarded: Record<string, string> = {};

      const cookieHeader = reqHeaders.get("cookie");
      if (cookieHeader) {
        forwarded.cookie = cookieHeader;
      }

      const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      if (authToken) {
        forwarded.Authorization = `Bearer ${authToken}`;
      }

      return forwarded;
    } catch {
      // 构建期 / 无请求上下文场景静默回退
      return undefined;
    }
  });
}

registerServerAuthHeaders();
