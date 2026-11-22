import { env } from "@/env";

import { LruCache } from "../shared/lruCache";
import {
  getAmapCircuitReason,
  isAmapCircuitTripped,
  resetAmapCircuit,
  runCachedCircuitRequest,
  type SharedInFlight,
} from "./amapCircuit";
import { describeAmapInfo } from "./amapMessages";
import {
  type AmapPlace,
  type AmapSearchResult,
  type GeocodeAdapter,
  HttpGeocodeAdapter,
  type InMemoryGeocodeSeed,
  InMemoryGeocodeAdapter,
} from "./geocodeAdapter";

export type { AmapPlace, AmapSearchResult, GeocodeAdapter, InMemoryGeocodeSeed };
export {
  HttpGeocodeAdapter,
  InMemoryGeocodeAdapter,
  LruCache,
  describeAmapInfo,
  getAmapCircuitReason,
  isAmapCircuitTripped,
  resetAmapCircuit,
};

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

/** 注入自定义地理编码适配器（测试替身或自定义网关） */
export function setGeocodeAdapter(adapter: GeocodeAdapter | null): void {
  activeAdapter = adapter ?? defaultHttpAdapter;
  proxyEnabledCache = null;
  proxyProbePromise = null;
}

export function getGeocodeAdapter(): GeocodeAdapter {
  return activeAdapter;
}

/** 探测同源 `/api/geocode` 服务端代理是否可用（单例去重，避免重复探针） */
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

/** 逆地理编码：GCJ-02 坐标 -> 结构化地址 */
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

/** 关键字搜索：地名 -> 候选点位（GCJ-02） */
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
