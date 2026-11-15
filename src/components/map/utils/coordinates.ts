/**
 * High-precision coordinate transformation utility
 * WGS-84 (International standard GPS) ⇋ GCJ-02 (China Mars coordinates: Amap/Tencent) ⇋ BD-09 (Baidu)
 * Pure mathematical algorithms with finite & range validation.
 */

import type { Coordinates } from "../shared/types";

export type CoordinateSystem = "WGS84" | "GCJ02" | "BD09";

const PI = Math.PI;
const X_PI = (PI * 3000.0) / 180.0;
const A = 6378245.0; // Krasovsky ellipsoid semi-major axis
const EE = 0.006693421622965943; // First eccentricity squared

/**
 * Validates that coordinates are finite numbers within WGS84 geographic bounds.
 */
export function isValidCoordinate(coords: unknown): coords is Coordinates {
  if (!Array.isArray(coords) || coords.length < 2) return false;
  const [lng, lat] = coords;
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Checks if coordinates are within the mainland boundary of China.
 */
export function isInsideChina(coords: Coordinates): boolean {
  if (!isValidCoordinate(coords)) return false;
  const [lng, lat] = coords;
  return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
}

/**
 * 底图对应的显示坐标系
 *
 * 高德瓦片本身就是 GCJ-02，其余默认底图（Carto / OSM / Tianditu / Blank）为 WGS84；
 * 自定义底图允许显式指定 `basemapCRS` 覆盖。
 */
export function getBasemapCRS(basemap?: string, basemapCRS?: CoordinateSystem): CoordinateSystem {
  if (basemapCRS) return basemapCRS;
  return basemap === "amap" ? "GCJ02" : "WGS84";
}

/** 输入坐标系 / 底图显示坐标系，以及两者之间是否需要转换 */
export function resolveCoordinateSystems(
  coordinateSystem?: CoordinateSystem,
  basemap?: string,
  basemapCRS?: CoordinateSystem,
): { sourceCoords: CoordinateSystem; targetCoords: CoordinateSystem; needsTransform: boolean } {
  const sourceCoords = coordinateSystem ?? "WGS84";
  const targetCoords = getBasemapCRS(basemap, basemapCRS);
  return { sourceCoords, targetCoords, needsTransform: sourceCoords !== targetCoords };
}

function roundCoord(value: number): number {
  return Number(value.toFixed(6));
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

/** 内部无舍入 WGS84 -> GCJ02，供迭代求逆避免中间步量化误差 */
function wgs84ToGcj02Raw(coords: Coordinates): Coordinates {
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

  return [lng + dLng, lat + dLat];
}

/**
 * WGS-84 to GCJ-02 (GPS -> Amap/Tencent)
 */
export function wgs84ToGcj02(coords: Coordinates): Coordinates {
  if (!isValidCoordinate(coords)) return coords;
  const [gcjLng, gcjLat] = wgs84ToGcj02Raw(coords);
  return [roundCoord(gcjLng), roundCoord(gcjLat)];
}

/**
 * GCJ-02 to WGS-84 (Amap/Tencent -> Standard GPS)
 * 使用无中间舍入的 6 轮迭代逼近算法，保证 6 位小数往返收敛。
 */
export function gcj02ToWgs84(coords: Coordinates): Coordinates {
  if (!isValidCoordinate(coords) || !isInsideChina(coords)) return coords;

  const [lng, lat] = coords;
  let wLng = lng;
  let wLat = lat;
  for (let i = 0; i < 6; i++) {
    const [cLng, cLat] = wgs84ToGcj02Raw([wLng, wLat]);
    wLng += lng - cLng;
    wLat += lat - cLat;
  }

  return [roundCoord(wLng), roundCoord(wLat)];
}

/**
 * GCJ-02 to BD-09 (Amap/Tencent -> Baidu)
 * 境外坐标保持原值，不施加国内百度偏移。
 */
export function gcj02ToBd09(coords: Coordinates): Coordinates {
  if (!isValidCoordinate(coords) || !isInsideChina(coords)) return coords;
  const [lng, lat] = coords;
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  const bdLng = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return [roundCoord(bdLng), roundCoord(bdLat)];
}

/**
 * BD-09 to GCJ-02 (Baidu -> Amap/Tencent)
 */
export function bd09ToGcj02(coords: Coordinates): Coordinates {
  if (!isValidCoordinate(coords) || !isInsideChina(coords)) return coords;
  const [lng, lat] = coords;
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  const gcjLng = z * Math.cos(theta);
  const gcjLat = z * Math.sin(theta);
  return [roundCoord(gcjLng), roundCoord(gcjLat)];
}

/**
 * WGS-84 to BD-09 (GPS -> Baidu)
 */
export function wgs84ToBd09(coords: Coordinates): Coordinates {
  if (!isValidCoordinate(coords) || !isInsideChina(coords)) return coords;
  return gcj02ToBd09(wgs84ToGcj02Raw(coords));
}

/**
 * BD-09 to WGS-84 (Baidu -> GPS)
 */
export function bd09ToWgs84(coords: Coordinates): Coordinates {
  if (!isValidCoordinate(coords) || !isInsideChina(coords)) return coords;
  return gcj02ToWgs84(bd09ToGcj02(coords));
}

/**
 * Universal Coordinate Transformer (returns input unchanged if invalid)
 */
export function transformCoordinates(
  coords: Coordinates,
  fromCRS: CoordinateSystem = "WGS84",
  toCRS: CoordinateSystem = "WGS84",
): Coordinates {
  if (!isValidCoordinate(coords) || fromCRS === toCRS) return coords;

  let wgs: Coordinates = coords;
  if (fromCRS === "GCJ02") {
    wgs = gcj02ToWgs84(coords);
  } else if (fromCRS === "BD09") {
    wgs = bd09ToWgs84(coords);
  }

  if (toCRS === "WGS84") return wgs;
  if (toCRS === "GCJ02") return wgs84ToGcj02(wgs);
  if (toCRS === "BD09") return wgs84ToBd09(wgs);

  return coords;
}
