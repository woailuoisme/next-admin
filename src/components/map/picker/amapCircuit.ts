import { AMAP_COOLDOWN_REASON, AMAP_RATE_LIMIT_REASON, describeAmapInfo, formatHttpErrorReason } from "./amapMessages";
import type { GeocodeFetchResponse } from "./geocodeAdapter";
import type { LruCache } from "../shared/lruCache";

const FATAL_CIRCUIT_INFOS = new Set([
  "INVALID_USER_KEY",
  "USERKEY_PLAT_NOMATCH",
  "SERVICE_NOT_AVAILABLE",
  "DAILY_QUERY_OVER_LIMIT",
  "MISSING_AMAP_KEY",
]);

const CIRCUIT_COOLDOWN_MS = 60_000;
const NEGATIVE_CACHE_TTL_MS = 30_000;

export interface SharedInFlight<T> {
  promise: Promise<T>;
  controller: AbortController;
  subscribers: number;
}

type CircuitState = "closed" | "open" | "half-open";
let circuitState: CircuitState = "closed";
let circuitOpenedAt = 0;
let circuitTripReason: string | null = null;
let warnedInfo: string | null = null;

/** 是否已触发高德 API 冷却熔断（超过 60s 冷却窗后自动转为半开态允许单次探测） */
export function isAmapCircuitTripped(): boolean {
  if (circuitState === "closed") return false;
  if (circuitState === "open") {
    if (Date.now() - circuitOpenedAt >= CIRCUIT_COOLDOWN_MS) {
      circuitState = "half-open";
      return false;
    }
    return true;
  }
  return false;
}

export function getAmapCircuitReason(): string | null {
  return circuitTripReason;
}

export function resetAmapCircuit(): void {
  circuitState = "closed";
  circuitOpenedAt = 0;
  circuitTripReason = null;
  warnedInfo = null;
}

function tripCircuit(reason: string): void {
  circuitState = "open";
  circuitOpenedAt = Date.now();
  circuitTripReason = reason;
}

function warnAmapFailure(info: string) {
  if (warnedInfo === info) return;
  warnedInfo = info;
  console.warn(`[map] ${describeAmapInfo(info)}`);
}

function handleUpstreamError(httpStatus?: number, errorInfo?: string): string | undefined {
  if (httpStatus === 429) {
    tripCircuit(AMAP_RATE_LIMIT_REASON);
    warnAmapFailure("DAILY_QUERY_OVER_LIMIT");
    return AMAP_RATE_LIMIT_REASON;
  }

  if (errorInfo && FATAL_CIRCUIT_INFOS.has(errorInfo)) {
    const reason = describeAmapInfo(errorInfo);
    tripCircuit(reason);
    warnAmapFailure(errorInfo);
    return reason;
  }

  if (errorInfo) {
    warnAmapFailure(errorInfo);
    return describeAmapInfo(errorInfo);
  }

  if (httpStatus) {
    return formatHttpErrorReason(httpStatus);
  }

  return undefined;
}

function runSharedRequest<T>(
  map: Map<string, SharedInFlight<T>>,
  key: string,
  callerSignal: AbortSignal | undefined,
  abortedFallback: T,
  taskFactory: (sharedSignal: AbortSignal) => Promise<T>,
): Promise<T> {
  if (callerSignal?.aborted) {
    return Promise.resolve(abortedFallback);
  }

  let entry = map.get(key);
  if (!entry) {
    const controller = new AbortController();
    const promise = taskFactory(controller.signal).finally(() => {
      map.delete(key);
    });
    entry = { promise, controller, subscribers: 0 };
    map.set(key, entry);
  }

  entry.subscribers += 1;
  const currentEntry = entry;

  if (!callerSignal) {
    return currentEntry.promise.finally(() => {
      currentEntry.subscribers = Math.max(0, currentEntry.subscribers - 1);
    });
  }

  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const handleAbort = () => {
      if (settled) return;
      settled = true;
      currentEntry.subscribers = Math.max(0, currentEntry.subscribers - 1);
      if (currentEntry.subscribers === 0) {
        currentEntry.controller.abort();
      }
      resolve(abortedFallback);
    };

    callerSignal.addEventListener("abort", handleAbort, { once: true });

    currentEntry.promise.then(
      (result) => {
        if (settled) return;
        settled = true;
        callerSignal.removeEventListener("abort", handleAbort);
        currentEntry.subscribers = Math.max(0, currentEntry.subscribers - 1);
        resolve(result);
      },
      (err) => {
        if (settled) return;
        settled = true;
        callerSignal.removeEventListener("abort", handleAbort);
        currentEntry.subscribers = Math.max(0, currentEntry.subscribers - 1);
        reject(err);
      },
    );
  });
}

export interface CachedCircuitPipelineOptions<TPayload, TResult, TCacheValue> {
  cache: LruCache<string, TCacheValue>;
  negativeCache: Map<string, number>;
  inFlightMap: Map<string, SharedInFlight<TResult>>;
  key: string;
  signal?: AbortSignal;
  fallback: TResult;
  circuitFallback: (reason: string) => TResult;
  errorFallback: (error?: string) => TResult;
  fetchFn: (sharedSignal: AbortSignal) => Promise<GeocodeFetchResponse<TPayload>>;
  toCacheValue: (result: TResult) => TCacheValue | null;
  fromCacheValue: (cached: TCacheValue) => TResult;
  parsePayload: (payload: TPayload) => TResult;
}

/**
 * 统一的「熔断校验 -> 正/负缓存 -> 并发去重（独立 Abort） -> 半开复位 -> 缓存写回」请求管线
 */
export async function runCachedCircuitRequest<TPayload, TResult, TCacheValue>({
  cache,
  negativeCache,
  inFlightMap,
  key,
  signal,
  fallback,
  circuitFallback,
  errorFallback,
  fetchFn,
  toCacheValue,
  fromCacheValue,
  parsePayload,
}: CachedCircuitPipelineOptions<TPayload, TResult, TCacheValue>): Promise<TResult> {
  if (signal?.aborted) return fallback;
  if (isAmapCircuitTripped()) {
    return circuitFallback(circuitTripReason ?? AMAP_COOLDOWN_REASON);
  }

  const cached = cache.get(key);
  if (cached !== undefined) return fromCacheValue(cached);

  const negExpiresAt = negativeCache.get(key);
  if (negExpiresAt !== undefined) {
    if (Date.now() < negExpiresAt) return fallback;
    negativeCache.delete(key);
  }

  return runSharedRequest(inFlightMap, key, signal, fallback, async (sharedSignal) => {
    const { data, httpStatus, errorInfo, aborted } = await fetchFn(sharedSignal);
    if (aborted || sharedSignal.aborted) return fallback;

    if (!data) {
      return errorFallback(handleUpstreamError(httpStatus, errorInfo));
    }

    if (circuitState === "half-open") {
      resetAmapCircuit();
    }

    const result = parsePayload(data);
    const cacheable = toCacheValue(result);
    if (cacheable !== null) {
      cache.set(key, cacheable);
    } else {
      negativeCache.set(key, Date.now() + NEGATIVE_CACHE_TTL_MS);
    }

    return result;
  });
}
