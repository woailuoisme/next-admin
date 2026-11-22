import type * as GeoJSON from "geojson";

import type { Coordinates } from "../shared/types";

import { CHINA_MAP_CENTER } from "../shared/constants";
import { type CoordinateSystem, isValidCoordinate, transformCoordinates } from "./coordinates";

export {
  buildChoroplethSteps,
  type ChoroplethComputation,
  type ChoroplethLegendStep,
  parseFiniteMetricValue,
} from "./choropleth";

export interface GeoBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  center: Coordinates;
  spansAntimeridian: boolean;
  isSinglePoint: boolean;
}

/** 过滤非法或非有限坐标序列，防止 NaN / Infinity 传入 MapLibre 引发渲染异常。 */
export function sanitizeCoordinatesList(points: readonly Coordinates[]): Coordinates[] {
  return points.filter((pt) => isValidCoordinate(pt));
}

/** 计算点集的精确地理边界框与居中中心，支持单点与跨日界线（太平洋航线/东西半球）数据集。 */
export function computeBounds(points: readonly Coordinates[]): GeoBounds | null {
  const valid = sanitizeCoordinatesList(points);
  if (valid.length === 0) return null;

  let south = 90;
  let north = -90;
  let minLngDirect = 180;
  let maxLngDirect = -180;
  let minLngWrapped = 360;
  let maxLngWrapped = 0;

  for (const [lng, lat] of valid) {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < minLngDirect) minLngDirect = lng;
    if (lng > maxLngDirect) maxLngDirect = lng;

    const wrapped = lng < 0 ? lng + 360 : lng;
    if (wrapped < minLngWrapped) minLngWrapped = wrapped;
    if (wrapped > maxLngWrapped) maxLngWrapped = wrapped;
  }

  const directSpan = maxLngDirect - minLngDirect;
  const wrappedSpan = maxLngWrapped - minLngWrapped;
  const spansAntimeridian = wrappedSpan < directSpan && directSpan > 180;

  const midLat = (south + north) / 2;
  let centerLng: number;
  let west: number;
  let east: number;

  if (spansAntimeridian) {
    west = minLngWrapped > 180 ? minLngWrapped - 360 : minLngWrapped;
    east = maxLngWrapped > 180 ? maxLngWrapped - 360 : maxLngWrapped;
    const midWrapped = (minLngWrapped + maxLngWrapped) / 2;
    centerLng = midWrapped > 180 ? midWrapped - 360 : midWrapped;
  } else {
    west = minLngDirect;
    east = maxLngDirect;
    centerLng = (minLngDirect + maxLngDirect) / 2;
  }

  const isSinglePoint = directSpan < 1e-6 && north - south < 1e-6;

  return {
    west,
    south,
    east,
    north,
    center: [Number(centerLng.toFixed(6)), Number(midLat.toFixed(6))],
    spansAntimeridian,
    isSinglePoint,
  };
}

/** 解析地图默认中心点：优先显式合法 center -> 边界框中心 -> 回退国内默认中心。 */
export function resolveBoundingCenter(
  points: readonly Coordinates[],
  explicitCenter?: Coordinates,
  fallbackCenter: Coordinates = CHINA_MAP_CENTER,
): Coordinates {
  if (isValidCoordinate(explicitCenter)) return explicitCenter;
  return computeBounds(points)?.center ?? fallbackCenter;
}

function normalizeLon(lng: number): number {
  let x = lng;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

/** 生成弧线点列并在跨越 ±180° 国际日界线时切分为多段 LineString。 */
export function buildSplitArcSegments(
  from: Coordinates,
  to: Coordinates,
  curvature = 0.25,
  samples = 64,
): Coordinates[][] {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) return [];

  const [x0, y0] = from;
  const [xTo, y2] = to;
  const rawDx = xTo - x0;
  const x2 = rawDx > 180 ? xTo - 360 : rawDx < -180 ? xTo + 360 : xTo;
  const dx = x2 - x0;
  const dy = y2 - y0;
  const distance = Math.hypot(dx, dy);

  const rawPoints: Coordinates[] = [];
  if (distance === 0 || curvature === 0) {
    rawPoints.push([x0, y0], [x2, y2]);
  } else {
    const mx = (x0 + x2) / 2;
    const my = (y0 + y2) / 2;
    const nx = -dy / distance;
    const ny = dx / distance;
    const offset = distance * curvature;
    const cx = mx + nx * offset;
    const cy = my + ny * offset;

    const segs = Math.max(2, Math.floor(samples));
    for (let i = 0; i <= segs; i += 1) {
      const t = i / segs;
      const inv = 1 - t;
      const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x2;
      const y = Math.max(-85, Math.min(85, inv * inv * y0 + 2 * inv * t * cy + t * t * y2));
      rawPoints.push([x, y]);
    }
  }

  const segments: Coordinates[][] = [];
  let current: Coordinates[] = [];

  for (let i = 0; i < rawPoints.length; i += 1) {
    const [rawLng, lat] = rawPoints[i];
    const normLng = normalizeLon(rawLng);

    if (current.length > 0) {
      const prevLng = current[current.length - 1][0];
      if (Math.abs(normLng - prevLng) > 180) {
        const prevLat = current[current.length - 1][1];
        const crossEdge = prevLng > 0 ? 180 : -180;
        const oppEdge = -crossEdge;
        const ratio =
          Math.abs(crossEdge - prevLng) / (Math.abs(crossEdge - prevLng) + Math.abs(normLng - oppEdge) || 1);
        const crossLat = prevLat + (lat - prevLat) * ratio;

        current.push([crossEdge, crossLat]);
        segments.push(current);
        current = [[oppEdge, crossLat]];
      }
    }

    current.push([normLng, lat]);
  }

  if (current.length > 0) segments.push(current);
  return segments.filter((s) => s.length >= 2);
}

/** 从 GeoJSON 数据结构提取全部有效坐标点用于边界框自适应。 */
export function extractGeoJSONPoints(geojson: GeoJSON.GeoJSON): Coordinates[] {
  const points: Coordinates[] = [];

  function walkCoords(coords: unknown): void {
    if (!Array.isArray(coords) || coords.length === 0) return;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      if (isValidCoordinate(coords)) points.push([coords[0], coords[1]]);
      return;
    }
    for (const child of coords) walkCoords(child);
  }

  function walkGeometry(geom: GeoJSON.Geometry | null | undefined): void {
    if (!geom) return;
    if (geom.type === "GeometryCollection") {
      for (const g of geom.geometries) walkGeometry(g);
    } else {
      walkCoords(geom.coordinates);
    }
  }

  if (geojson.type === "FeatureCollection") {
    for (const f of geojson.features) walkGeometry(f.geometry);
  } else if (geojson.type === "Feature") {
    walkGeometry(geojson.geometry);
  } else {
    walkGeometry(geojson);
  }

  return points;
}

/** 递归对 GeoJSON 要素集进行坐标系转换（如 WGS84 多边形转换至高德 GCJ02 底图）。 */
export function transformGeoJSON<T extends GeoJSON.GeoJSON>(
  data: T,
  fromCRS: CoordinateSystem,
  toCRS: CoordinateSystem,
): T {
  if (fromCRS === toCRS) return data;

  function mapPositionArray(coords: unknown): unknown {
    if (!Array.isArray(coords) || coords.length === 0) return coords;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      return isValidCoordinate(coords) ? transformCoordinates([coords[0], coords[1]], fromCRS, toCRS) : coords;
    }
    return coords.map((child) => mapPositionArray(child));
  }

  function mapGeometry(geom: GeoJSON.Geometry): GeoJSON.Geometry {
    if (geom.type === "GeometryCollection") {
      return { ...geom, geometries: geom.geometries.map(mapGeometry) };
    }
    return { ...geom, coordinates: mapPositionArray(geom.coordinates) } as GeoJSON.Geometry;
  }

  if (data.type === "FeatureCollection") {
    return {
      ...data,
      features: data.features.map((f) => ({
        ...f,
        geometry: f.geometry ? mapGeometry(f.geometry) : f.geometry,
      })),
    };
  }

  if (data.type === "Feature") {
    return {
      ...data,
      geometry: data.geometry ? mapGeometry(data.geometry) : data.geometry,
    };
  }

  return mapGeometry(data as GeoJSON.Geometry) as T;
}
