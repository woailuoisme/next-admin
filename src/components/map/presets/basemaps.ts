import type { StyleSpecification } from "maplibre-gl";

import { env } from "@/env";

export type BasemapStyleKey = "carto" | "osm" | "amap" | "tianditu" | "blank";
export type BasemapPreset = BasemapStyleKey | "custom";

export interface BasemapOption {
  label: string;
  value: BasemapStyleKey;
  description?: string;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  { label: "标准浅/深色 (Carto)", value: "carto", description: "自适应系统与主题色彩的矢量底图" },
  { label: "开放街道 (OSM)", value: "osm", description: "OpenFreeMap 街道与地理地标" },
  { label: "高德地图 (Amap)", value: "amap", description: "国内高德标准道路与注记底图 (GCJ-02)" },
  {
    label: "天地图 (Tianditu)",
    value: "tianditu",
    description: "国家地理信息公共服务平台权威矢量底图",
  },
  { label: "纯透明底图 (Blank)", value: "blank", description: "无瓦片透明背景，专注于数据图层" },
];

export const BASEMAP_PRESETS = BASEMAP_OPTIONS;

export const BLANK_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "rgba(0, 0, 0, 0)" },
    },
  ],
};

/**
 * 底图服务 Token（通过 `.env` 变量注入，见 `src/env.ts`）
 *
 * - `TIANDITU_TOKEN`：**必需**。缺 token 或 token 失效时天地图瓦片接口会拒绝请求
 *   （实测失效 token 返回 `403 application/json`），底图呈整图空白。
 *   （申请：https://console.tianditu.gov.cn/ → 创建应用 → 浏览器端 key，需加入域名白名单）
 * - `AMAP_KEY`：可选。当前使用的 XYZ 栅格瓦片端点
 *   `wprd0X.is.autonavi.com/appmaptile` 本身免 key，仅改用需授权端点时才需要
 */
const TIANDITU_TOKEN = env.TIANDITU_TOKEN;
const AMAP_KEY = env.AMAP_KEY;

let hasWarnedTiandituToken = false;

/** 高德栅格瓦片子域（{x}/{y}/{z} 由 MapLibre 填充） */
const AMAP_TILE_HOSTS = ["wprd01", "wprd02", "wprd03", "wprd04"] as const;

function buildAmapTiles(key?: string): string[] {
  const query = "x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7";
  return AMAP_TILE_HOSTS.map((host) =>
    key
      ? `https://${host}.is.autonavi.com/appmaptile?${query}&key=${key}`
      : `https://${host}.is.autonavi.com/appmaptile?${query}`,
  );
}

export function createAmapStyle(key: string | undefined = AMAP_KEY): StyleSpecification {
  return {
    version: 8,
    sources: {
      "amap-tiles": {
        type: "raster",
        tiles: buildAmapTiles(key),
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "amap-layer",
        type: "raster",
        source: "amap-tiles",
        minzoom: 0,
        maxzoom: 18,
      },
    ],
  };
}

export const AMAP_MAP_STYLE: StyleSpecification = createAmapStyle();

function buildTiandituTiles(layer: "vec" | "cva", tokenQuery: string): string[] {
  const query = `SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}${tokenQuery}`;
  return ["t0", "t1"].map((host) => `https://${host}.tianditu.gov.cn/${layer}_w/wmts?${query}`);
}

export function createTiandituStyle(tk: string | undefined = TIANDITU_TOKEN): StyleSpecification {
  const tokenQuery = tk ? `&tk=${tk}` : "";
  return {
    version: 8,
    sources: {
      "tdt-vec": {
        type: "raster",
        tiles: buildTiandituTiles("vec", tokenQuery),
        tileSize: 256,
      },
      "tdt-cva": {
        type: "raster",
        tiles: buildTiandituTiles("cva", tokenQuery),
        tileSize: 256,
      },
    },
    layers: [
      { id: "tdt-vec-layer", type: "raster", source: "tdt-vec", minzoom: 0, maxzoom: 18 },
      { id: "tdt-cva-layer", type: "raster", source: "tdt-cva", minzoom: 0, maxzoom: 18 },
    ],
  };
}

export const TIANDITU_MAP_STYLE: StyleSpecification = createTiandituStyle();

export const BASEMAP_STYLES: Record<
  BasemapStyleKey,
  { light?: string | StyleSpecification; dark?: string | StyleSpecification; blank?: boolean }
> = {
  carto: {
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  osm: {
    light: "https://tiles.openfreemap.org/styles/liberty",
    dark: "https://tiles.openfreemap.org/styles/dark",
  },
  amap: {
    light: AMAP_MAP_STYLE,
    dark: AMAP_MAP_STYLE,
  },
  tianditu: {
    light: TIANDITU_MAP_STYLE,
    dark: TIANDITU_MAP_STYLE,
  },
  blank: {
    blank: true,
  },
};

export type BasemapConfig = {
  styles?: {
    light?: string | StyleSpecification;
    dark?: string | StyleSpecification;
  };
  blank: boolean;
};

export function resolveBasemapConfig(
  key: BasemapPreset = "carto",
  customStyles?: { light?: string | StyleSpecification; dark?: string | StyleSpecification },
): BasemapConfig {
  if (key === "tianditu" && !TIANDITU_TOKEN && !hasWarnedTiandituToken) {
    hasWarnedTiandituToken = true;
    console.warn(
      "[map] 未配置 NEXT_PUBLIC_TIANDITU_TOKEN：天地图瓦片会被接口拒绝，底图将显示为空白。请参考 .env.example 配置。",
    );
  }

  if (customStyles) {
    return { styles: customStyles, blank: false };
  }
  const presetKey: BasemapStyleKey = key === "custom" ? "carto" : key;
  const preset = BASEMAP_STYLES[presetKey] ?? BASEMAP_STYLES.carto;
  if (preset.blank) {
    return { styles: undefined, blank: true };
  }
  return {
    styles: {
      light: preset.light,
      dark: preset.dark,
    },
    blank: false,
  };
}
