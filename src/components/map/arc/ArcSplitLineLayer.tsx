"use client";

import type * as GeoJSON from "geojson";
import type * as MapLibreGL from "maplibre-gl";

import { memo, useEffect, useId, useMemo, useRef } from "react";

import { useMap } from "@/components/ui/map";

import type { ResolvedArcItem } from "./useArcTopology";

import { buildSplitArcSegments } from "../utils/geoEngine";

export interface ArcSplitLineLayerProps {
  data: ResolvedArcItem[];
  curvature?: number;
  samples?: number;
  arcColor: string;
  arcHoverColor: string;
  arcWidth: number;
  hoverArcWidth?: number;
  arcOpacity?: number;
  interactive?: boolean;
  onHover?: (arc: ResolvedArcItem | null) => void;
  onClick?: (arc: ResolvedArcItem) => void;
}

const HIT_LINE_MIN_WIDTH = 12;

function buildArcPaintSpecs(
  arcColor: string,
  arcHoverColor: string,
  arcWidth: number,
  effectiveHoverWidth: number,
  arcOpacity: number,
) {
  return {
    lineColor: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      arcHoverColor,
      ["coalesce", ["get", "color"], arcColor],
    ] as MapLibreGL.ExpressionSpecification,
    lineWidth: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      effectiveHoverWidth,
      arcWidth,
    ] as MapLibreGL.ExpressionSpecification,
    lineOpacity: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      arcOpacity,
    ] as MapLibreGL.ExpressionSpecification,
    hitLineColor: ["coalesce", ["get", "color"], arcColor] as MapLibreGL.ExpressionSpecification,
    hitLineWidth: Math.max(HIT_LINE_MIN_WIDTH, arcWidth + 8),
  };
}

export const ArcSplitLineLayer = memo(function ArcSplitLineLayer({
  data,
  curvature = 0.25,
  samples = 64,
  arcColor,
  arcHoverColor,
  arcWidth,
  hoverArcWidth,
  arcOpacity = 0.72,
  interactive = true,
  onHover,
  onClick,
}: ArcSplitLineLayerProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const sourceId = `arc-split-src-${autoId}`;
  const lineLayerId = `arc-split-line-${autoId}`;
  const hitLayerId = `arc-split-hit-${autoId}`;

  const latestRef = useRef({ onHover, onClick, data });
  latestRef.current = { onHover, onClick, data };

  const arcIndexMap = useMemo(() => {
    const mapById = new Map<string, ResolvedArcItem>();
    for (const arc of data) {
      mapById.set(arc.id, arc);
    }
    return mapById;
  }, [data]);
  const arcIndexRef = useRef(arcIndexMap);
  arcIndexRef.current = arcIndexMap;

  const geojson = useMemo<GeoJSON.FeatureCollection<GeoJSON.MultiLineString>>(
    () => ({
      type: "FeatureCollection",
      features: data.map((arc) => ({
        type: "Feature",
        id: arc.id,
        properties: {
          id: arc.id,
          ...(arc.color ? { color: arc.color } : {}),
        },
        geometry: {
          type: "MultiLineString",
          coordinates: buildSplitArcSegments(arc.from, arc.to, curvature, samples),
        },
      })),
    }),
    [curvature, data, samples],
  );
  const latestGeojsonRef = useRef(geojson);
  latestGeojsonRef.current = geojson;

  const effectiveHoverWidth = hoverArcWidth ?? arcWidth + 2;
  const paintSpecs = useMemo(
    () => buildArcPaintSpecs(arcColor, arcHoverColor, arcWidth, effectiveHoverWidth, arcOpacity),
    [arcColor, arcHoverColor, arcOpacity, arcWidth, effectiveHoverWidth],
  );
  const latestPaintRef = useRef(paintSpecs);
  latestPaintRef.current = paintSpecs;

  // Effect 1: 挂载数据源与图层
  useEffect(() => {
    if (!isLoaded || !map) return;

    const initialPaint = latestPaintRef.current;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: latestGeojsonRef.current,
        promoteId: "id",
      });
    }

    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": initialPaint.lineColor,
          "line-width": initialPaint.lineWidth,
          "line-opacity": initialPaint.lineOpacity,
        },
      });
    }

    if (!map.getLayer(hitLayerId)) {
      map.addLayer({
        id: hitLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": initialPaint.hitLineColor,
          "line-opacity": 0,
          "line-width": initialPaint.hitLineWidth,
        },
      });
    }

    return () => {
      try {
        if (map.getLayer(hitLayerId)) map.removeLayer(hitLayerId);
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // 样式重建期间忽略清理异常
      }
    };
  }, [isLoaded, map, sourceId, lineLayerId, hitLayerId]);

  // Effect 2: 同步 GeoJSON 数据而不重挂图层
  useEffect(() => {
    if (!isLoaded || !map) return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
    source?.setData(geojson);
  }, [geojson, isLoaded, map, sourceId]);

  // Effect 3: 增量更新画笔样式（支持切换深浅主题或传入色板）
  useEffect(() => {
    if (!isLoaded || !map || !map.getSource(sourceId) || !map.getLayer(lineLayerId)) return;
    map.setPaintProperty(lineLayerId, "line-color", paintSpecs.lineColor);
    map.setPaintProperty(lineLayerId, "line-width", paintSpecs.lineWidth);
    map.setPaintProperty(lineLayerId, "line-opacity", paintSpecs.lineOpacity);
    if (map.getLayer(hitLayerId)) {
      map.setPaintProperty(hitLayerId, "line-width", paintSpecs.hitLineWidth);
    }
  }, [hitLayerId, isLoaded, lineLayerId, map, paintSpecs, sourceId]);

  // Effect 4: 绑定悬浮与点击交互
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;

    let hoveredId: string | number | null = null;

    const setHover = (nextId: string | number | null) => {
      if (nextId === hoveredId) return;
      const sourceExists = !!map.getSource(sourceId);
      if (hoveredId != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
      }
      hoveredId = nextId;
      if (nextId != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: nextId }, { hover: true });
      }
    };

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      map.getCanvas().style.cursor = "pointer";
      const rawId = feature.properties?.id ?? feature.id;
      const featureId = rawId != null ? String(rawId) : undefined;
      if (!featureId || featureId === hoveredId) return;
      setHover(featureId);
      const match = arcIndexRef.current.get(featureId) ?? null;
      latestRef.current.onHover?.(match);
    };

    const handleMouseLeave = () => {
      setHover(null);
      map.getCanvas().style.cursor = "";
      latestRef.current.onHover?.(null);
    };

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      const rawId = feature?.properties?.id ?? feature?.id;
      const featureId = rawId != null ? String(rawId) : undefined;
      if (!featureId) return;
      const match = arcIndexRef.current.get(featureId);
      if (match) {
        latestRef.current.onClick?.(match);
      }
    };

    map.on("mousemove", hitLayerId, handleMouseMove);
    map.on("mouseleave", hitLayerId, handleMouseLeave);
    map.on("click", hitLayerId, handleClick);

    return () => {
      try {
        map.off("mousemove", hitLayerId, handleMouseMove);
        map.off("mouseleave", hitLayerId, handleMouseLeave);
        map.off("click", hitLayerId, handleClick);
        setHover(null);
        map.getCanvas().style.cursor = "";
      } catch {
        // 地图卸载或样式重建阶段忽略底层清理异常
      }
    };
  }, [hitLayerId, interactive, isLoaded, map, sourceId]);

  return null;
});
