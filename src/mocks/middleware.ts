import { isPlainObject, randomInt } from "es-toolkit";
import { delay, HttpResponse } from "msw";

import type { ApiPaginationMeta } from "@/types";

/**
 * 检查当前是否处于单元测试环境 (Vitest)
 */
export function isTestEnv(): boolean {
  return typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST === "true");
}

/**
 * 解析当前请求所期望的延时
 * 1. 测试环境下默认 0ms (保证测试极速完成)
 * 2. 优先读取请求头 `x-mock-delay` 或 query 参数 `_delay`
 * 3. 正常开发环境下默认 150ms ~ 350ms 真实抖动
 */
export async function simulateNetwork(request: Request): Promise<void> {
  if (isTestEnv()) {
    return;
  }

  const url = new URL(request.url);
  const headerDelay = request.headers.get("x-mock-delay");
  const queryDelay = url.searchParams.get("_delay");

  const explicitDelay = headerDelay ?? queryDelay;
  if (explicitDelay !== null) {
    const parsed = Number.parseInt(explicitDelay, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      await delay(parsed);
      return;
    }
  }

  // 服务端 SSR 阶段或测试环境不增加人为网络延迟（除非显式指定 delay 参数）
  if (typeof window === "undefined") {
    return;
  }

  // 客户端真实环境网络往返延时随机抖动 (150ms - 350ms)
  await delay(randomInt(150, 350));
}

/**
 * 检查是否由请求头或 Query 触发了精准故障注入
 * 支持 x-mock-error: 400 | 401 | 403 | 404 | 409 | 422 | 500
 */
export function checkChaosError(request: Request): Response | null {
  const url = new URL(request.url);
  const errorParam = request.headers.get("x-mock-error") ?? url.searchParams.get("_error");

  if (!errorParam) return null;

  const status = Number.parseInt(errorParam, 10);
  switch (status) {
    case 400:
      return jsonError(400, "BAD_REQUEST", "Invalid request parameters");
    case 401:
      return jsonError(401, "UNAUTHORIZED", "Authentication required or token expired");
    case 403:
      return jsonError(403, "FORBIDDEN", "You do not have permission to perform this action");
    case 404:
      return jsonError(404, "NOT_FOUND", "Target resource not found");
    case 409:
      return jsonError(409, "CONFLICT", "Resource conflict or unique constraint violation");
    case 422:
      return jsonError(422, "VALIDATION_FAILED", "Request body validation failed", {
        name: ["Name must be at least 2 characters"],
        email: ["Email format is invalid"],
      });
    case 500:
      return jsonError(500, "INTERNAL_SERVER_ERROR", "Simulated server internal error");
    default:
      return null;
  }
}

interface IdempotencyRecord {
  requestHash: string;
  status: number;
  body: string;
}

const idempotencyStore = new Map<string, IdempotencyRecord>();

function getRequestHash(request: Request, bodyText?: string): string {
  return `${request.method}:${request.url}:${bodyText ?? ""}`;
}

export function resetIdempotencyStore(): void {
  idempotencyStore.clear();
}

/**
 * 校验 Idempotency-Key 头并保障接口写操作重试幂等性:
 * 1. 相同 Key + 相同 Payload -> 命中重放 (Replay)
 * 2. 相同 Key + 不同 Payload -> 返回 HTTP 422 拒绝冲突 (Payload Mismatch)
 */
export function checkIdempotency(request: Request, bodyText?: string): Response | null {
  const key = request.headers.get("Idempotency-Key");
  if (!key) return null;

  const existing = idempotencyStore.get(key);
  if (!existing) return null;

  if (existing.requestHash !== getRequestHash(request, bodyText)) {
    return jsonError(
      422,
      "IDEMPOTENCY_KEY_PAYLOAD_MISMATCH",
      "Idempotency key was previously used with a different request payload",
    );
  }

  return HttpResponse.json(JSON.parse(existing.body), { status: existing.status });
}

export function saveIdempotencyRecord(
  request: Request,
  bodyText: string | undefined,
  status: number,
  payload: unknown,
): void {
  const key = request.headers.get("Idempotency-Key");
  if (!key) return;

  idempotencyStore.set(key, {
    requestHash: getRequestHash(request, bodyText),
    status,
    body: JSON.stringify(payload),
  });
}

function createEnvelope<T>(data: T, extra?: Record<string, unknown>) {
  return {
    data,
    ...(isPlainObject(data) ? (data as Record<string, unknown>) : {}),
    ...extra,
  };
}

/**
 * 辅助函数：构造 200 OK 统一包装响应 { data, ...extra }
 * 若 data 是非数组对象，同时展开其一级属性以提供双向平滑兼容
 */
export function jsonOk<T>(data: T, extra?: Record<string, unknown>): Response {
  return HttpResponse.json(createEnvelope(data, extra), { status: 200 });
}

/**
 * 辅助函数：构造 201 Created 统一包装响应 { data, ...extra }
 */
export function jsonCreated<T>(data: T, extra?: Record<string, unknown>): Response {
  return HttpResponse.json(createEnvelope(data, extra), { status: 201 });
}

/**
 * 辅助函数：构造 200 OK 分页统一包装响应 { data: T[], meta, ...extra }
 */
export function jsonPaginated<T>(data: T[], meta: ApiPaginationMeta, extra?: Record<string, unknown>): Response {
  return HttpResponse.json({ data, meta, ...extra }, { status: 200 });
}

/**
 * 辅助函数：构造 204 No Content 响应 (HTTP 204，0 字节空 Body)
 */
export function jsonNoContent(): Response {
  return new HttpResponse(null, { status: 204 });
}

/**
 * 辅助函数：构造标准 RFC 结构化错误响应 { error: { code, message, fields } }
 */
export function jsonError(status: number, code: string, message: string, fields?: Record<string, string[]>): Response {
  return HttpResponse.json(
    {
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
    },
    { status },
  );
}
