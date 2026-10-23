/**
 * High-precision coordinate transformation utility
 * WGS-84 (International standard GPS) ⇋ GCJ-02 (China Mars coordinates: Amap/Tencent) ⇋ BD-09 (Baidu)
 * Pure mathematical algorithms with zero external dependencies.
 */

import type { Coordinates } from "../shared/types";

export type CoordinateSystem = "WGS84" | "GCJ02" | "BD09";

const PI = Math.PI;
const X_PI = (PI * 3000.0) / 180.0;
const A = 6378245.0; // Krasovsky ellipsoid semi-major axis
const EE = 0.006693421622965943; // First eccentricity squared

/**
 * Checks if coordinates are within the mainland boundary of China
 */
export function isInsideChina(coords: Coordinates): boolean {
  const [lng, lat] = coords;
  return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
}

/**
 * 底图对应的显示坐标系
 *
 * 高德瓦片本身就是 GCJ-02，其余底图（Carto / OSM）为 WGS84。
 * 不做转换会让标点与底图偏移数百米。
 */
export function getBasemapCRS(basemap?: string): CoordinateSystem {
  return basemap === "amap" ? "GCJ02" : "WGS84";
}

/** 输入坐标系 / 底图显示坐标系，以及两者之间是否需要转换 */
export function resolveCoordinateSystems(
  coordinateSystem?: CoordinateSystem,
  basemap?: string,
): { sourceCoords: CoordinateSystem; targetCoords: CoordinateSystem; needsTransform: boolean } {
  const sourceCoords = coordinateSystem ?? "WGS84";
  const targetCoords = getBasemapCRS(basemap);
  return { sourceCoords, targetCoords, needsTransform: sourceCoords !== targetCoords };
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/**
 * WGS-84 to GCJ-02 (GPS -> Amap/Tencent)
 */
export function wgs84ToGcj02(coords: Coordinates): Coordinates {
  const [lng, lat] = coords;
  if (!isInsideChina(coords)) return [lng, lat];

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);

  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);

  return [Number((lng + dLng).toFixed(6)), Number((lat + dLat).toFixed(6))];
}

/**
 * GCJ-02 to WGS-84 (Amap/Tencent -> Standard GPS)
 * 使用 4 轮迭代逼近算法，消除简易逆公式在多轮转换下逐次累积的漂移（保证毫米级/6位小数零漂移）
 */
export function gcj02ToWgs84(coords: Coordinates): Coordinates {
  const [lng, lat] = coords;
  if (!isInsideChina(coords)) return [lng, lat];

  let wLng = lng;
  let wLat = lat;
  for (let i = 0; i < 4; i++) {
    const [cLng, cLat] = wgs84ToGcj02([wLng, wLat]);
    wLng += lng - cLng;
    wLat += lat - cLat;
  }

  return [Number(wLng.toFixed(6)), Number(wLat.toFixed(6))];
}

/**
 * GCJ-02 to BD-09 (Amap/Tencent -> Baidu)
 */
export function gcj02ToBd09(coords: Coordinates): Coordinates {
  const [lng, lat] = coords;
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  const bdLng = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return [Number(bdLng.toFixed(6)), Number(bdLat.toFixed(6))];
}

/**
 * BD-09 to GCJ-02 (Baidu -> Amap/Tencent)
 */
export function bd09ToGcj02(coords: Coordinates): Coordinates {
  const [lng, lat] = coords;
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  const gcjLng = z * Math.cos(theta);
  const gcjLat = z * Math.sin(theta);
  return [Number(gcjLng.toFixed(6)), Number(gcjLat.toFixed(6))];
}

/**
 * WGS-84 to BD-09 (GPS -> Baidu)
 */
export function wgs84ToBd09(coords: Coordinates): Coordinates {
  return gcj02ToBd09(wgs84ToGcj02(coords));
}

/**
 * BD-09 to WGS-84 (Baidu -> GPS)
 */
export function bd09ToWgs84(coords: Coordinates): Coordinates {
  return gcj02ToWgs84(bd09ToGcj02(coords));
}

/**
 * Universal Coordinate Transformer
 */
export function transformCoordinates(
  coords: Coordinates,
  fromCRS: CoordinateSystem = "WGS84",
  toCRS: CoordinateSystem = "WGS84",
): Coordinates {
  if (fromCRS === toCRS) return coords;

  // From -> WGS84
  let wgs: Coordinates = coords;
  if (fromCRS === "GCJ02") {
    wgs = gcj02ToWgs84(coords);
  } else if (fromCRS === "BD09") {
    wgs = bd09ToWgs84(coords);
  }

  // WGS84 -> To
  if (toCRS === "WGS84") return wgs;
  if (toCRS === "GCJ02") return wgs84ToGcj02(wgs);
  if (toCRS === "BD09") return wgs84ToBd09(wgs);

  return coords;
}
