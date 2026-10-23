import { isPlainObject, trimEnd } from "es-toolkit";
import ky from "ky";
import { toast } from "sonner";

import { env } from "@/env";
import { clearAuthSession, getAuthToken } from "@/stores/auth";

export function toSearchParams(params: unknown): string {
  if (!isPlainObject(params)) return "";
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined && item !== "") {
          searchParams.append(`${key}[]`, String(item));
        }
      }
    } else if (isPlainObject(value)) {
      for (const [subKey, subVal] of Object.entries(value)) {
        if (subVal !== null && subVal !== undefined && subVal !== "") {
          searchParams.append(`${key}[${subKey}]`, String(subVal));
        }
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

/** 服务端渲染时用于拼接绝对地址的站点来源 */
function resolveServerOrigin(): string {
  return process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
}

export function resolveApiPrefix(baseUrl?: string): string {
  if (!baseUrl) {
    return typeof window === "undefined" ? `${trimEnd(resolveServerOrigin(), "/")}/v1` : "/v1";
  }
  const trimmed = trimEnd(baseUrl, "/");
  const withV1 = trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
  const isRelative = !withV1.startsWith("http://") && !withV1.startsWith("https://");
  if (typeof window === "undefined" && isRelative) {
    return `${trimEnd(resolveServerOrigin(), "/")}${withV1.startsWith("/") ? "" : "/"}${withV1}`;
  }
  return withV1;
}

export type UnauthorizedHandler = () => void;

function createRequestId(): string {
  return `req_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

function handleUnauthorized() {
  if (typeof window === "undefined") {
    return;
  }
  // 没有本地会话时的 401 表示「未认证」而非「会话失效」（例如忘记密码流程），不应踢出
  if (!getAuthToken()) {
    return;
  }
  // 进度条收尾交由 router 侧统一处理（进度条的唯一驱动源是路由切换）
  clearAuthSession();
  if (unauthorizedHandler) {
    unauthorizedHandler();
  } else if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export const apiClient = ky.create({
  prefix: resolveApiPrefix(env.API_URL),
  retry: 0,
  credentials: "include", // 关键支持：前后端 HttpOnly Cookie 自动携带与凭证安全传输
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getAuthToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        if (!request.headers.has("x-request-id")) {
          request.headers.set("x-request-id", createRequestId());
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (response.status === 401) {
          handleUnauthorized();
        }
      },
    ],
  },
});

export function createIdempotencyKey(): string {
  return `idemp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}

interface ApiErrorPayload {
  error?: { code?: string; message?: string; fields?: Record<string, string[]> };
}

async function readErrorPayload(error: object): Promise<ApiErrorPayload | undefined> {
  // ky 会把错误体预解析到 error.data，并消费 response body，优先读它
  const data = (error as { data?: unknown }).data;
  if (isPlainObject(data)) return data as ApiErrorPayload;

  const response = (error as { response?: Response }).response;
  if (!response || typeof response.clone !== "function") return undefined;

  try {
    return (await response.clone().json()) as ApiErrorPayload;
  } catch {
    return undefined;
  }
}

export async function parseApiError(
  error: unknown,
): Promise<{ code: string; message: string; fields?: Record<string, string[]> } | null> {
  if (!error || typeof error !== "object") return null;

  const payload = await readErrorPayload(error);
  if (payload?.error && typeof payload.error.message === "string") {
    return {
      code: payload.error.code ?? "UNKNOWN_ERROR",
      message: payload.error.message,
      fields: payload.error.fields,
    };
  }

  return null;
}

export async function getApiErrorMessage(error: unknown, fallback: string): Promise<string> {
  const parsed = await parseApiError(error);
  if (parsed?.message) return parsed.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function handleMutationError(fallback: string): (error: unknown) => Promise<void> {
  return async (error: unknown) => {
    const msg = await getApiErrorMessage(error, fallback);
    toast.error(msg);
  };
}
