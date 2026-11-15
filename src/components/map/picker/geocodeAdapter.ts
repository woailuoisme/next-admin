export interface AmapPlace {
  id: string;
  name: string;
  address: string;
  /** 高德返回的坐标系（GCJ-02） */
  lngLat: [number, number];
}

export interface AmapSearchResult {
  places: AmapPlace[];
  /** 接口拒绝服务或网络异常时的可展示原因 */
  error?: string;
}

export interface GeocodeSearchUpstreamResponse {
  status: string;
  info?: string;
  infocode?: string;
  pois?: Array<{
    id?: string;
    name?: string;
    address?: string | string[];
    location?: string;
  }>;
}

export interface GeocodeRegeoUpstreamResponse {
  status: string;
  info?: string;
  infocode?: string;
  regeocode?: {
    formatted_address?: string | string[];
  };
}

export interface GeocodeFetchResponse<T> {
  data: T | null;
  httpStatus?: number;
  errorInfo?: string;
  aborted?: boolean;
}

export interface GeocodeAdapter {
  readonly isConfigured?: () => boolean;
  probeStatus?: (signal?: AbortSignal) => Promise<boolean>;
  searchText: (keywords: string, signal?: AbortSignal) => Promise<GeocodeFetchResponse<GeocodeSearchUpstreamResponse>>;
  regeo: (
    location: [number, number],
    signal?: AbortSignal,
  ) => Promise<GeocodeFetchResponse<GeocodeRegeoUpstreamResponse>>;
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (typeof err === "object" && err !== null && "name" in err && (err as { name?: string }).name === "AbortError")
  );
}

/**
 * 默认浏览器代理适配器：通过同源 `/api/geocode` 转发请求，彻底避免在客户端暴露 AMAP_KEY。
 */
export class HttpGeocodeAdapter implements GeocodeAdapter {
  private readonly basePath: string;

  constructor(basePath = "/api/geocode") {
    this.basePath = basePath;
  }

  async probeStatus(signal?: AbortSignal): Promise<boolean> {
    if (typeof fetch !== "function") return false;
    try {
      const res = await fetch(`${this.basePath}?action=status`, { signal });
      if (!res.ok) return false;
      const json = (await res.json()) as { enabled?: boolean };
      return Boolean(json?.enabled);
    } catch {
      return false;
    }
  }

  async searchText(
    keywords: string,
    signal?: AbortSignal,
  ): Promise<GeocodeFetchResponse<GeocodeSearchUpstreamResponse>> {
    return this.request<GeocodeSearchUpstreamResponse>(
      `${this.basePath}?action=search&keywords=${encodeURIComponent(keywords)}`,
      signal,
    );
  }

  async regeo(
    [lng, lat]: [number, number],
    signal?: AbortSignal,
  ): Promise<GeocodeFetchResponse<GeocodeRegeoUpstreamResponse>> {
    const loc = `${lng.toFixed(6)},${lat.toFixed(6)}`;
    return this.request<GeocodeRegeoUpstreamResponse>(
      `${this.basePath}?action=regeo&location=${encodeURIComponent(loc)}`,
      signal,
    );
  }

  private async request<T extends { status?: string; info?: string }>(
    url: string,
    signal?: AbortSignal,
  ): Promise<GeocodeFetchResponse<T>> {
    if (signal?.aborted) return { data: null, aborted: true };
    if (typeof fetch !== "function") return { data: null, errorInfo: "FETCH_UNAVAILABLE" };

    try {
      const res = await fetch(url, { signal });
      const json = (await res.json().catch(() => null)) as T | null;

      if (!res.ok) {
        return {
          data: json,
          httpStatus: res.status,
          errorInfo: json?.info || `HTTP_${res.status}`,
        };
      }

      if (!json || json.status !== "1") {
        return {
          data: json,
          httpStatus: res.status,
          errorInfo: json?.info ?? "UNKNOWN",
        };
      }

      return { data: json, httpStatus: res.status };
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) {
        return { data: null, aborted: true };
      }
      return { data: null, errorInfo: "NETWORK_ERROR" };
    }
  }
}

export interface InMemoryGeocodeSeed {
  placesByKeyword?: Record<string, AmapPlace[]>;
  addressesByGrid?: Record<string, string>;
  errorInfo?: string;
  httpStatus?: number;
  delayMs?: number;
  onCall?: (kind: "search" | "regeo", key: string) => void;
}

/**
 * 内存测试双工（Test Double）：供单测与离线 Storybook 零网络依赖验证防抖、熔断与取消语义。
 */
export class InMemoryGeocodeAdapter implements GeocodeAdapter {
  private readonly seed: InMemoryGeocodeSeed;

  constructor(seed: InMemoryGeocodeSeed = {}) {
    this.seed = seed;
  }

  isConfigured(): boolean {
    return true;
  }

  async probeStatus(): Promise<boolean> {
    return true;
  }

  async searchText(
    keywords: string,
    signal?: AbortSignal,
  ): Promise<GeocodeFetchResponse<GeocodeSearchUpstreamResponse>> {
    this.seed.onCall?.("search", keywords);
    await this.waitDelay(signal);
    if (signal?.aborted) return { data: null, aborted: true };
    if (this.seed.errorInfo || this.seed.httpStatus) {
      return { data: null, httpStatus: this.seed.httpStatus, errorInfo: this.seed.errorInfo };
    }

    const matches = this.seed.placesByKeyword?.[keywords.toLowerCase()] ?? [];
    return {
      data: {
        status: "1",
        pois: matches.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          location: `${p.lngLat[0]},${p.lngLat[1]}`,
        })),
      },
      httpStatus: 200,
    };
  }

  async regeo(
    [lng, lat]: [number, number],
    signal?: AbortSignal,
  ): Promise<GeocodeFetchResponse<GeocodeRegeoUpstreamResponse>> {
    const gridKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;
    this.seed.onCall?.("regeo", gridKey);
    await this.waitDelay(signal);
    if (signal?.aborted) return { data: null, aborted: true };
    if (this.seed.errorInfo || this.seed.httpStatus) {
      return { data: null, httpStatus: this.seed.httpStatus, errorInfo: this.seed.errorInfo };
    }

    const address = this.seed.addressesByGrid?.[gridKey];
    return {
      data: {
        status: "1",
        regeocode: {
          formatted_address: address ?? "",
        },
      },
      httpStatus: 200,
    };
  }

  private waitDelay(signal?: AbortSignal): Promise<void> {
    const ms = this.seed.delayMs ?? 0;
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => {
      if (signal?.aborted) {
        resolve();
        return;
      }
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
  }
}
