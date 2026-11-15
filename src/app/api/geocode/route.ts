import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

const AMAP_REST_BASE = "https://restapi.amap.com/v3";
const REQUEST_TIMEOUT_MS = 8000;
const COORD_PAIR_RE = /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/;
const AUTH_COOKIE_NAME = "auth_token";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_MAX_TRACKED_CLIENTS = 5000;
const rateBuckets = new Map<string, number[]>();

/** 进程内滑动窗口限流：保护服务端 AMAP_KEY 配额不被单一客户端耗尽 */
function isRateLimited(clientKey: string, now = Date.now()): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (rateBuckets.get(clientKey) ?? []).filter((ts) => ts > windowStart);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateBuckets.set(clientKey, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.delete(clientKey);
  rateBuckets.set(clientKey, recent);

  if (rateBuckets.size > RATE_LIMIT_MAX_TRACKED_CLIENTS) {
    const oldest = rateBuckets.keys().next().value;
    if (oldest !== undefined) rateBuckets.delete(oldest);
  }
  return false;
}

function resolveClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function GET(request: NextRequest) {
  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    return NextResponse.json({ status: "0", info: "UNAUTHORIZED" }, { status: 401 });
  }

  if (isRateLimited(resolveClientKey(request))) {
    return NextResponse.json(
      { status: "0", info: "DAILY_QUERY_OVER_LIMIT" },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_MS / 1000) } },
    );
  }

  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");
  const serverKey = process.env.AMAP_KEY || env.AMAP_KEY;

  if (action === "status") {
    return NextResponse.json({ enabled: Boolean(serverKey) });
  }

  if (!serverKey) {
    return NextResponse.json({ status: "0", info: "MISSING_AMAP_KEY" }, { status: 503 });
  }

  if (action === "search") {
    const keywords = (searchParams.get("keywords") ?? "").trim();
    if (!keywords || keywords.length > 100) {
      return NextResponse.json({ status: "0", info: "INVALID_PARAMS" }, { status: 400 });
    }

    const upstream = new URL(`${AMAP_REST_BASE}/place/text`);
    upstream.searchParams.set("key", serverKey);
    upstream.searchParams.set("keywords", keywords);
    upstream.searchParams.set("offset", "8");
    upstream.searchParams.set("page", "1");
    upstream.searchParams.set("extensions", "base");

    return proxyAmapRequest(upstream);
  }

  if (action === "regeo") {
    const location = (searchParams.get("location") ?? "").trim();
    if (!COORD_PAIR_RE.test(location)) {
      return NextResponse.json({ status: "0", info: "INVALID_PARAMS" }, { status: 400 });
    }

    const [lng, lat] = location.split(",").map(Number);
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return NextResponse.json({ status: "0", info: "INVALID_PARAMS" }, { status: 400 });
    }

    const upstream = new URL(`${AMAP_REST_BASE}/geocode/regeo`);
    upstream.searchParams.set("key", serverKey);
    upstream.searchParams.set("location", `${lng.toFixed(6)},${lat.toFixed(6)}`);
    upstream.searchParams.set("extensions", "base");

    return proxyAmapRequest(upstream);
  }

  return NextResponse.json({ status: "0", info: "INVALID_PARAMS" }, { status: 400 });
}

async function proxyAmapRequest(url: URL) {
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ status: "0", info: `HTTP_${res.status}` }, { status: res.status });
    }

    const data = (await res.json()) as unknown;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "0", info: "UPSTREAM_FETCH_ERROR" }, { status: 502 });
  }
}
