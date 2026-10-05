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

export function resolveApiPrefix(baseUrl?: string): string {
  if (!baseUrl) {
    if (typeof window === "undefined") {
      const serverOrigin = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
      return `${trimEnd(serverOrigin, "/")}/v1`;
    }
    return "/v1";
  }
  const trimmed = trimEnd(baseUrl, "/");
  const withV1 = trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
  if (
    typeof window === "undefined" &&
    !withV1.startsWith("http://") &&
    !withV1.startsWith("https://")
  ) {
    const serverOrigin = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${trimEnd(serverOrigin, "/")}${withV1.startsWith("/") ? "" : "/"}${withV1}`;
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

export async function parseApiError(
  error: unknown,
): Promise<{ code: string; message: string; fields?: Record<string, string[]> } | null> {
  if (!error || typeof error !== "object") return null;

  if ("response" in error && error.response instanceof Response) {
    try {
      const data = (await error.response.clone().json()) as
        | { error?: { code?: string; message?: string; fields?: Record<string, string[]> } }
        | undefined;
      if (data?.error && typeof data.error.message === "string") {
        return {
          code: data.error.code ?? "UNKNOWN_ERROR",
          message: data.error.message,
          fields: data.error.fields,
        };
      }
    } catch {
      // Non-JSON response
    }
  }

  return null;
}

export async function getApiErrorMessage(error: unknown, fallback: string): Promise<string> {
  const parsed = await parseApiError(error);
  return parsed?.message || (error instanceof Error && error.message ? error.message : fallback);
}

export function handleMutationError(fallback: string): (error: unknown) => Promise<void> {
  return async (error: unknown) => {
    const msg = await getApiErrorMessage(error, fallback);
    toast.error(msg);
  };
}
