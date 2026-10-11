import { env } from "@/env";

/**
 * 高德 Web 服务 API（REST）客户端
 *
 * - 入参 / 出参坐标均为 **GCJ-02**（高德坐标系），与底图坐标系一致
 * - 实测 `restapi.amap.com` 返回 `Access-Control-Allow-Origin: *`，浏览器可直连，无需服务端代理
 * - 未配置 `NEXT_PUBLIC_AMAP_KEY` 时所有方法**安全降级**（返回 null / 空结果，不抛错）
 * - 高德用字符串 `"1"` / `"0"` 表示成功 / 失败。失败必须**给出可读原因**：
 *   最常见的是 key 平台类型不匹配（`USERKEY_PLAT_NOMATCH` —— 用了「Web端(JS API)」key
 *   去调「Web服务」REST 接口），静默返回空结果会让使用者完全无从排查。
 * - **防过度访问与配额保护机制**：
 *   1. 内存 LRU 缓存：地名搜索与逆地理编码均缓存最近 100 条结果，杜绝重复请求；
 *   2. 坐标网格化（Coordinate Snapping）：逆地理编码以 4 位小数（约 10 米精度）为网格 Key，
 *      微小拖拽或同一建筑物内点选直接命中缓存；
 *   3. 在途 Promise 去重（In-Flight Deduplication）：并发相同请求复用单一 Promise，避免网络风暴；
 *   4. 会话级熔断（Circuit Breaker）：遇到配额用尽或平台不匹配等致命错误时自动熔断，阻断后续无效调用。
 */
const AMAP_REST_BASE = "https://restapi.amap.com/v3";

/** 地名搜索结果项（坐标为 GCJ-02） */
export interface AmapPlace {
  id: string;
  name: string;
  address: string;
  lngLat: [number, number];
}

export interface AmapSearchResult {
  places: AmapPlace[];
  /** 调用失败时的可读原因；成功或未配置 key 时为 undefined */
  error?: string;
}

interface AmapEnvelope {
  status?: string;
  info?: string;
  infocode?: string;
}

/**
 * 轻量高性能通用 LRU 内存缓存
 */
export class LruCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private readonly maxCapacity: number = 100) {}

  public get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    // 刷新访问顺序（移至尾部最新）
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  public set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxCapacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  public has(key: K): boolean {
    return this.cache.has(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public get size(): number {
    return this.cache.size;
  }
}

/** 致命错误码：触发后自动开启会话级熔断，避免继续向高德刷无意义请求 */
const FATAL_CIRCUIT_INFOS = new Set(["INVALID_USER_KEY", "USERKEY_PLAT_NOMATCH", "DAILY_QUERY_OVER_LIMIT"]);

/** 模块内单例缓存与在途请求去重池 */
const searchCache = new LruCache<string, AmapSearchResult>(100);
const regeoCache = new LruCache<string, string>(100);

const inFlightSearches = new Map<string, Promise<AmapSearchResult>>();
const inFlightRegeos = new Map<string, Promise<string | null>>();

/** 会话级熔断状态 */
let isCircuitTripped = false;
let circuitTripReason: string | null = null;
let warnedInfo: string | null = null;

/** 是否已触发高德 API 会话熔断 */
export function isAmapCircuitTripped(): boolean {
  return isCircuitTripped;
}

/** 获取熔断原因 */
export function getAmapCircuitReason(): string | null {
  return circuitTripReason;
}

/** 手动重置熔断状态（通常在配置更新或测试隔离时调用） */
export function resetAmapCircuit(): void {
  isCircuitTripped = false;
  circuitTripReason = null;
  warnedInfo = null;
}

/** 清空内部缓存与在途请求池（测试隔离或页面重置时使用） */
export function resetAmapCache(): void {
  searchCache.clear();
  regeoCache.clear();
  inFlightSearches.clear();
  inFlightRegeos.clear();
}

/**
 * 坐标网格化：按 4 位小数（经纬度约 10 米分辨率网格）归一化，
 * 避免微米级的微调或同一建筑物的反复拖拽触发多余的高德接口请求。
 */
export function snapCoordinateToGrid([lng, lat]: [number, number], decimals = 4): string {
  return `${lng.toFixed(decimals)},${lat.toFixed(decimals)}`;
}

/** 是否已配置高德 key（未配置时地名搜索与逆地理编码不可用） */
export function isAmapApiEnabled(): boolean {
  return Boolean(env.AMAP_KEY);
}

/** 把高德的 `info` 错误码翻译成可操作的中文提示 */
export function describeAmapInfo(info: string): string {
  switch (info) {
    case "INVALID_USER_KEY":
      return "高德 key 无效，请检查 NEXT_PUBLIC_AMAP_KEY 是否填写正确";
    case "USERKEY_PLAT_NOMATCH":
      return "高德 key 平台类型不匹配：当前 key 是「Web端(JS API)」，需在高德控制台创建「Web服务」类型的 key";
    case "SERVICE_NOT_AVAILABLE":
      return "高德服务暂不可用，请稍后重试";
    case "DAILY_QUERY_OVER_LIMIT":
      return "高德接口今日配额已用尽";
    case "INVALID_PARAMS":
      return "高德接口参数有误";
    default:
      return `高德接口返回错误：${info}`;
  }
}

/** 同一个错误码只告警一次，避免每条输入都刷屏 */
function warnAmapFailure(info: string) {
  if (warnedInfo === info) return;
  warnedInfo = info;
  console.warn(`[map] ${describeAmapInfo(info)}`);
}

async function fetchAmap<T extends AmapEnvelope>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<{ data: T | null; error?: string }> {
  const key = env.AMAP_KEY;
  // 未配置 key：调用方本就不该发起请求，静默即可
  if (!key) return { data: null };

  // 已进入熔断状态：阻断后续无效网络请求
  if (isCircuitTripped) {
    return { data: null, error: circuitTripReason ?? "高德接口已熔断" };
  }

  const query = new URLSearchParams({ key, ...params });
  try {
    const res = await fetch(`${AMAP_REST_BASE}/${path}?${query.toString()}`, { signal });
    if (!res.ok) {
      if (res.status === 429) {
        isCircuitTripped = true;
        circuitTripReason = "高德接口请求频次过高（HTTP 429），已自动熔断保护";
        warnAmapFailure("DAILY_QUERY_OVER_LIMIT");
      }
      return { data: null, error: `高德接口请求失败（HTTP ${res.status}）` };
    }

    const json = (await res.json()) as T;
    if (json.status === "1") return { data: json };

    const info = json.info ?? "UNKNOWN";
    if (FATAL_CIRCUIT_INFOS.has(info)) {
      isCircuitTripped = true;
      circuitTripReason = describeAmapInfo(info);
    }
    warnAmapFailure(info);
    return { data: null, error: describeAmapInfo(info) };
  } catch {
    // AbortError / 网络中断：属正常流程（输入变化、组件卸载），静默降级
    return { data: null };
  }
}

/** 坐标对 → 高德 `location` 参数（`lng,lat`，6 位小数） */
function toLocationParam([lng, lat]: [number, number]): string {
  return `${lng.toFixed(6)},${lat.toFixed(6)}`;
}

/**
 * 逆地理编码：GCJ-02 坐标 → 结构化地址
 * 包含：4 位网格坐标化缓存、在途去重与熔断保护
 */
export async function reverseGeocode(lngLat: [number, number], signal?: AbortSignal): Promise<string | null> {
  if (isCircuitTripped) return null;

  const gridKey = snapCoordinateToGrid(lngLat, 4);

  // 1. 命中 LRU 内存缓存
  const cached = regeoCache.get(gridKey);
  if (cached !== undefined) {
    return cached;
  }

  // 2. 复用在途重复 Promise
  const inFlight = inFlightRegeos.get(gridKey);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = (async () => {
    try {
      const { data } = await fetchAmap<
        AmapEnvelope & { regeocode?: { formatted_address?: string | string[] } }
      >("geocode/regeo", { location: toLocationParam(lngLat), extensions: "base" }, signal);

      const address = data?.regeocode?.formatted_address;
      const validAddress = typeof address === "string" && address ? address : null;

      if (validAddress) {
        regeoCache.set(gridKey, validAddress);
      }
      return validAddress;
    } finally {
      inFlightRegeos.delete(gridKey);
    }
  })();

  inFlightRegeos.set(gridKey, requestPromise);
  return requestPromise;
}

/**
 * 关键字搜索：地名 → 候选点位（GCJ-02）
 * 包含：LRU 内存缓存、在途去重与熔断保护
 */
export async function searchPlaces(keyword: string, signal?: AbortSignal): Promise<AmapSearchResult> {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return { places: [] };

  if (isCircuitTripped) {
    return { places: [], error: circuitTripReason ?? "高德接口已熔断" };
  }

  // 1. 命中 LRU 内存缓存
  const cached = searchCache.get(trimmed);
  if (cached !== undefined) {
    return cached;
  }

  // 2. 复用在途请求
  const inFlight = inFlightSearches.get(trimmed);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = (async () => {
    try {
      const { data, error } = await fetchAmap<
        AmapEnvelope & {
          pois?: Array<{
            id?: string;
            name?: string;
            address?: string | string[];
            location?: string;
          }>;
        }
      >("place/text", { keywords: trimmed, offset: "8", page: "1", extensions: "base" }, signal);

      if (!data) return { places: [], error };

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

      const result: AmapSearchResult = { places };
      if (places.length > 0) {
        searchCache.set(trimmed, result);
      }
      return result;
    } finally {
      inFlightSearches.delete(trimmed);
    }
  })();

  inFlightSearches.set(trimmed, requestPromise);
  return requestPromise;
}
