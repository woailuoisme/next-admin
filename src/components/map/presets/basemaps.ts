import type { StyleSpecification } from "maplibre-gl";

import { env } from "@/env";
import type { MessageKeyOf } from "@/types/i18n";

export type BasemapStyleKey = "carto" | "osm" | "amap" | "tianditu" | "blank";
export type BasemapPreset = BasemapStyleKey | "custom";

export interface BasemapOption {
  labelKey: MessageKeyOf<"map">;
  descKey: MessageKeyOf<"map">;
  value: BasemapStyleKey;
  /** 非 React/非 i18n 场景回退标签 */
  label: string;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    value: "carto",
    labelKey: "basemap_carto",
    descKey: "basemap_carto_desc",
    label: "Carto",
  },
  {
    value: "osm",
    labelKey: "basemap_osm",
    descKey: "basemap_osm_desc",
    label: "OpenStreetMap",
  },
  {
    value: "amap",
    labelKey: "basemap_amap",
    descKey: "basemap_amap_desc",
    label: "Amap",
  },
  {
    value: "tianditu",
    labelKey: "basemap_tianditu",
    descKey: "basemap_tianditu_desc",
    label: "Tianditu",
  },
  {
    value: "blank",
    labelKey: "basemap_blank",
    descKey: "basemap_blank_desc",
    label: "Blank",
  },
];

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

const TIANDITU_TOKEN = env.TIANDITU_TOKEN;
const AMAP_KEY = env.AMAP_KEY;

export function isTiandituConfigured(tk: string | undefined = TIANDITU_TOKEN): boolean {
  return Boolean(tk?.trim());
}

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
        attribution: "© AutoNavi (高德地图)",
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
        attribution: "© 国家地理信息公共服务平台 (天地图)",
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
  /** 当所选底图因缺失密钥（如天地图未配置 Token）自动降级为同坐标系可用底图时记录原底图 */
  degradedFrom?: BasemapStyleKey;
};

export function resolveBasemapConfig(
  key: BasemapPreset = "carto",
  customStyles?: { light?: string | StyleSpecification; dark?: string | StyleSpecification },
): BasemapConfig {
  if (customStyles) {
    return { styles: customStyles, blank: false };
  }
  const presetKey: BasemapStyleKey = key === "custom" ? "carto" : key;
  if (presetKey === "tianditu" && !isTiandituConfigured()) {
    return {
      styles: {
        light: BASEMAP_STYLES.osm.light,
        dark: BASEMAP_STYLES.osm.dark,
      },
      blank: false,
      degradedFrom: "tianditu",
    };
  }
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
