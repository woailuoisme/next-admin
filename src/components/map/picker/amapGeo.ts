import { env } from "@/env";

import { AMAP_COOLDOWN_REASON, AMAP_RATE_LIMIT_REASON, describeAmapInfo, formatHttpErrorReason } from "./amapMessages";
import {
  type AmapPlace,
  type AmapSearchResult,
  type GeocodeAdapter,
  type GeocodeFetchResponse,
  HttpGeocodeAdapter,
  type InMemoryGeocodeSeed,
  InMemoryGeocodeAdapter,
} from "./geocodeAdapter";

export type { AmapPlace, AmapSearchResult, GeocodeAdapter, InMemoryGeocodeSeed };
export { HttpGeocodeAdapter, InMemoryGeocodeAdapter, describeAmapInfo };

/** 致命错误码：遇到这些 key / 限流 / 服务端缺失配置时触发冷却熔断 */
const FATAL_CIRCUIT_INFOS = new Set([
  "INVALID_USER_KEY",
  "USERKEY_PLAT_NOMATCH",
  "SERVICE_NOT_AVAILABLE",
  "DAILY_QUERY_OVER_LIMIT",
  "MISSING_AMAP_KEY",
]);

const CIRCUIT_COOLDOWN_MS = 60_000;
const NEGATIVE_CACHE_TTL_MS = 30_000;

/**
 * 轻量 LRU 缓存（利用 JS `Map` 保持插入顺序，命中时刷新为最新）
 */
export class LruCache<K, V> {
  private readonly store = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get size(): number {
    return this.store.size;
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  get(key: K): V | undefined {
    if (!this.store.has(key)) return undefined;
    const value = this.store.get(key) as V;
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, value);
  }

  clear(): void {
    this.store.clear();
  }
}

interface SharedInFlight<T> {
  promise: Promise<T>;
  controller: AbortController;
  subscribers: number;
}

const searchCache = new LruCache<string, AmapSearchResult>(100);
const regeoCache = new LruCache<string, string>(200);
const negativeSearchCache = new Map<string, number>();
const negativeRegeoCache = new Map<string, number>();
const inFlightSearches = new Map<string, SharedInFlight<AmapSearchResult>>();
const inFlightRegeos = new Map<string, SharedInFlight<string | null>>();

const defaultHttpAdapter = new HttpGeocodeAdapter();
let activeAdapter: GeocodeAdapter = defaultHttpAdapter;
let proxyEnabledCache: boolean | null = null;
let proxyProbePromise: Promise<boolean> | null = null;

type CircuitState = "closed" | "open" | "half-open";
let circuitState: CircuitState = "closed";
let circuitOpenedAt = 0;
let circuitTripReason: string | null = null;
let warnedInfo: string | null = null;

/** 注入自定义地理编码适配器（测试替身或自定义网关） */
export function setGeocodeAdapter(adapter: GeocodeAdapter | null): void {
  activeAdapter = adapter ?? defaultHttpAdapter;
  proxyEnabledCache = null;
  proxyProbePromise = null;
}

export function getGeocodeAdapter(): GeocodeAdapter {
  return activeAdapter;
}

/**
 * 探测同源 `/api/geocode` 服务端代理是否可用（单例去重，避免重复探针）
 */
export async function probeGeocodeProxy(signal?: AbortSignal): Promise<boolean> {
  if (activeAdapter.isConfigured) {
    const ok = activeAdapter.isConfigured();
    proxyEnabledCache = ok;
    return ok;
  }
  if (env.AMAP_KEY) {
    proxyEnabledCache = true;
    return true;
  }
  if (proxyEnabledCache !== null) return proxyEnabledCache;
  if (!activeAdapter.probeStatus) return false;

  if (!proxyProbePromise) {
    proxyProbePromise = activeAdapter
      .probeStatus(signal)
      .then((enabled) => {
        proxyEnabledCache = enabled;
        return enabled;
      })
      .catch(() => false)
      .finally(() => {
        proxyProbePromise = null;
      });
  }
  return proxyProbePromise;
}

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
  // half-open 允许探测
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

export function resetAmapCache(): void {
  searchCache.clear();
  regeoCache.clear();
  negativeSearchCache.clear();
  negativeRegeoCache.clear();
  for (const entry of inFlightSearches.values()) entry.controller.abort();
  for (const entry of inFlightRegeos.values()) entry.controller.abort();
  inFlightSearches.clear();
  inFlightRegeos.clear();
  proxyEnabledCache = null;
  proxyProbePromise = null;
}

function tripCircuit(reason: string): void {
  circuitState = "open";
  circuitOpenedAt = Date.now();
  circuitTripReason = reason;
}

export function snapCoordinateToGrid([lng, lat]: [number, number], decimals = 4): string {
  return `${lng.toFixed(decimals)},${lat.toFixed(decimals)}`;
}

/** 检查地理编码能力是否已启用（客户端环境变量、服务端探针缓存或注入适配器） */
export function isAmapApiEnabled(): boolean {
  if (activeAdapter.isConfigured) {
    return activeAdapter.isConfigured();
  }
  if (env.AMAP_KEY) return true;
  return proxyEnabledCache === true;
}

function warnAmapFailure(info: string) {
  if (warnedInfo === info) return;
  warnedInfo = info;
  console.warn(`[map] ${describeAmapInfo(info)}`);
}

/**
 * 为多个共享同一在途请求的调用方提供相互隔离的 AbortSignal 取消语义：
 * 单个调用方 abort 时立即退出，但不影响仍在等待的其他订阅者；
 * 仅当所有订阅者均取消时，才中止底层共享 HTTP 请求。
 */
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

interface CachedCircuitPipelineOptions<TPayload, TResult, TCacheValue> {
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
async function runCachedCircuitRequest<TPayload, TResult, TCacheValue>({
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

/**
 * 逆地理编码：GCJ-02 坐标 -> 结构化地址
 */
export async function reverseGeocode(lngLat: [number, number], signal?: AbortSignal): Promise<string | null> {
  const gridKey = snapCoordinateToGrid(lngLat, 4);
  return runCachedCircuitRequest({
    cache: regeoCache,
    negativeCache: negativeRegeoCache,
    inFlightMap: inFlightRegeos,
    key: gridKey,
    signal,
    fallback: null,
    circuitFallback: () => null,
    errorFallback: () => null,
    fetchFn: (sharedSignal) => activeAdapter.regeo(lngLat, sharedSignal),
    fromCacheValue: (addr) => addr,
    toCacheValue: (addr) => addr,
    parsePayload: (data) => {
      const address = data.regeocode?.formatted_address;
      return typeof address === "string" && address.length > 0 ? address : null;
    },
  });
}

/**
 * 关键字搜索：地名 -> 候选点位（GCJ-02）
 */
export async function searchPlaces(keyword: string, signal?: AbortSignal): Promise<AmapSearchResult> {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return { places: [] };

  return runCachedCircuitRequest({
    cache: searchCache,
    negativeCache: negativeSearchCache,
    inFlightMap: inFlightSearches,
    key: trimmed,
    signal,
    fallback: { places: [] },
    circuitFallback: (reason) => ({ places: [], error: reason }),
    errorFallback: (error) => ({ places: [], error }),
    fetchFn: (sharedSignal) => activeAdapter.searchText(trimmed, sharedSignal),
    fromCacheValue: (cached) => cached,
    toCacheValue: (res) => (res.places.length > 0 ? res : null),
    parsePayload: (data) => {
      const places = (data.pois ?? [])
        .map((poi): AmapPlace | null => {
          const [lng, lat] = String(poi.location ?? "")
            .split(",")
            .map(Number);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

          return {
            id: String(poi.id ?? poi.location),
            name: String(poi.name ?? ""),
            address: typeof poi.address === "string" ? poi.address : "",
            lngLat: [lng, lat],
          };
        })
        .filter((place): place is AmapPlace => place !== null);
      return { places };
    },
  });
}
