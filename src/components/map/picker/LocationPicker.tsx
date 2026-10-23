import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { debounce, type DebouncedFunction } from "es-toolkit";
import { LocateFixed, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "@/lib/utils";

import type { CoordinateSystem } from "../utils/coordinates";
import type { LocationPickerProps, LocationPickerValue } from "./types";

import { resolveBasemapConfig } from "../presets/basemaps";
import { MAP_NO_ATTRIBUTION } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapFlyTo } from "../shared/MapFlyTo";
import { getBasemapCRS, transformCoordinates } from "../utils/coordinates";
import { type AmapPlace, isAmapApiEnabled, reverseGeocode } from "./amapGeo";
import { LocationAddressSearch } from "./LocationAddressSearch";
import { LocationCoordinatesInput } from "./LocationCoordinatesInput";
import { MapClickHandler } from "./MapClickHandler";

const DEFAULT_BEIJING: LocationPickerValue = { lng: 116.4074, lat: 39.9042 };

/** 逆地理编码防抖：拖动结束后再补全地址，避免拖动过程连续请求 */
const REVERSE_GEOCODE_DEBOUNCE_MS = 400;

export function LocationPicker({
  coordinateSystem,
  value: controlledValue,
  defaultValue = DEFAULT_BEIJING,
  onChange,
  disabled = false,
  readOnly = false,
  showCoordinatesInput = true,
  showAddressSearch = true,
  showReset = true,
  height = 320,
  center,
  zoom = 12,
  basemap = "amap",
  customStyleUrl,
  className,
}: LocationPickerProps) {
  const t = useTranslations("map");
  const [internalValue, setInternalValue] = useState<LocationPickerValue>(controlledValue ?? defaultValue);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const sourceLng = currentValue?.lng;
  const sourceLat = currentValue?.lat;

  /** 对外契约坐标系：`value` / `onChange` 中的坐标即为该坐标系 */
  const sourceCRS: CoordinateSystem = coordinateSystem ?? "WGS84";
  /** 地图显示坐标系，与 useLocationMarkers / RouteTrackingMap 共用同一套底图约定 */
  const displayCRS = getBasemapCRS(basemap);

  const basemapConfig = useMemo(() => resolveBasemapConfig(basemap, customStyleUrl), [basemap, customStyleUrl]);

  // 外部契约坐标 → 显示坐标。拆成数值依赖，使「仅地址变化」时不会改变引用，
  // 从而不会反复触发下方的逆地理编码 effect
  const [displayLng, displayLat] = useMemo(() => {
    if (sourceLng === undefined || sourceLat === undefined) {
      return [undefined, undefined] as const;
    }
    return transformCoordinates([sourceLng, sourceLat], sourceCRS, displayCRS);
  }, [sourceLng, sourceLat, sourceCRS, displayCRS]);

  const displayPosition = useMemo<[number, number] | null>(
    () => (displayLng === undefined || displayLat === undefined ? null : [displayLng, displayLat]),
    [displayLng, displayLat],
  );

  /** 初始视野中心：显式 center 优先，其次当前坐标，最后回退默认点（均需为显示坐标系） */
  const mapCenter = useMemo<[number, number]>(() => {
    if (center) return center;
    if (displayPosition) return displayPosition;
    return transformCoordinates([DEFAULT_BEIJING.lng, DEFAULT_BEIJING.lat], "WGS84", displayCRS);
  }, [center, displayPosition, displayCRS]);

  /** 需要平滑飞往的目标；每次写入新数组以支持对同一坐标重复定位 */
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
  /** 首次渲染不飞，避免一打开面板就播一次动画 */
  const skipInitialFlyRef = useRef(true);
  /** 上次变更是否来自地图交互（点击 / 拖动）—— 那类变更视角已在现场，无需再飞 */
  const fromMapInteractionRef = useRef(false);

  /**
   * 「输入完成确认后自动定位」
   *
   * 凡非地图交互导致的点位变化（数字输入确认、地名搜索、快捷城市、外部改值）
   * 都自动飞过去；点击/拖动本身视角就在现场，不重复飞。
   */
  useEffect(() => {
    if (!displayPosition) return;

    if (skipInitialFlyRef.current) {
      skipInitialFlyRef.current = false;
      return;
    }

    if (fromMapInteractionRef.current) {
      fromMapInteractionRef.current = false;
      return;
    }

    setFlyToTarget([...displayPosition]);
  }, [displayPosition]);

  /**
   * 统一写回：把坐标从 `fromCRS` 转到对外契约坐标系后回传。
   * 传入 `address` 才会更新地址（传 null 表示清空），否则保留原值。
   */
  const commitPosition = useMemoizedFn(
    (lngLat: [number, number], fromCRS: CoordinateSystem, address?: string | null) => {
      if (disabled || readOnly) return;

      const [lng, lat] = transformCoordinates(lngLat, fromCRS, sourceCRS);
      const updated: LocationPickerValue = {
        ...currentValue,
        lng: Number(lng.toFixed(6)),
        lat: Number(lat.toFixed(6)),
      };
      if (address !== undefined) {
        updated.address = address ?? undefined;
      }

      if (!isControlled) setInternalValue(updated);
      onChange?.(updated);
    },
  );

  /**
   * 仅写回地址（逆地理编码成功后调用）。
   * 严禁重新计算或修改 lng / lat，阻断坐标微小浮点误差引发的无限循环与漂移。
   */
  const commitAddress = useMemoizedFn((address: string) => {
    if (disabled || readOnly || !currentValue) return;
    if (currentValue.address === address) return;

    const updated: LocationPickerValue = {
      ...currentValue,
      address,
    };

    if (!isControlled) setInternalValue(updated);
    onChange?.(updated);
  });

  // 点击地图选点：坐标为显示坐标系（标记本次变更来自地图交互，无需自动飞行，同时清空旧地址以触发逆地理编码）
  const handleMapPick = useMemoizedFn((coords: { lng: number; lat: number }) => {
    fromMapInteractionRef.current = true;
    commitPosition([coords.lng, coords.lat], displayCRS, null);
  });

  // 拖动标记微调：坐标为显示坐标系（同上）
  const handleMarkerDragEnd = useMemoizedFn((lngLat: { lng: number; lat: number }) => {
    fromMapInteractionRef.current = true;
    commitPosition([lngLat.lng, lngLat.lat], displayCRS, null);
  });

  const regeoAbortControllerRef = useRef<AbortController | null>(null);
  const debouncedRegeoRef = useRef<DebouncedFunction<(pos: [number, number], crs: CoordinateSystem) => void> | null>(
    null,
  );

  useEffect(() => {
    const debounced = debounce(async (pos: [number, number], crs: CoordinateSystem) => {
      regeoAbortControllerRef.current?.abort();
      const controller = new AbortController();
      regeoAbortControllerRef.current = controller;

      const gcjPosition = transformCoordinates(pos, crs, "GCJ02");
      const address = await reverseGeocode(gcjPosition, controller.signal);
      if (controller.signal.aborted || !address) return;
      commitAddress(address);
    }, REVERSE_GEOCODE_DEBOUNCE_MS);

    debouncedRegeoRef.current = debounced;

    return () => {
      debounced.cancel();
      regeoAbortControllerRef.current?.abort();
    };
  }, [commitAddress]);

  const lastGeocodedCoordsRef = useRef<string | null>(null);

  // 地名搜索选中：高德返回的坐标恒为 GCJ-02，已带有地名地址，取消防抖避免多余反查
  const handlePlaceSelect = useMemoizedFn((place: AmapPlace) => {
    debouncedRegeoRef.current?.cancel();
    regeoAbortControllerRef.current?.abort();
    const coordKey = `${place.lngLat[0].toFixed(5)},${place.lngLat[1].toFixed(5)}`;
    lastGeocodedCoordsRef.current = coordKey;
    commitPosition(place.lngLat, "GCJ02", place.address || place.name);
  });

  // 数字输入框遵循对外契约坐标系，直接以 sourceCRS 写回，同时清空旧地址以触发逆地理编码
  const handleCoordinatesChange = useMemoizedFn((coords: { lng: number; lat: number }) => {
    commitPosition([coords.lng, coords.lat], sourceCRS, null);
  });

  // 「获取当前定位」：浏览器 Geolocation 的结果恒为 WGS84，需转回对外契约坐标系
  const handleLocate = useMemoizedFn((coords: { longitude: number; latitude: number }) => {
    commitPosition([coords.longitude, coords.latitude], "WGS84", null);
  });

  const handleReset = useMemoizedFn(() => {
    if (disabled || readOnly) return;
    debouncedRegeoRef.current?.cancel();
    regeoAbortControllerRef.current?.abort();
    lastGeocodedCoordsRef.current = null;
    if (!isControlled) setInternalValue(defaultValue);
    onChange?.(defaultValue);
  });

  // 数字输入数值未变、按回车「确认」时：重新定位到当前点
  const handleCoordinatesConfirm = useMemoizedFn(() => {
    if (displayPosition) setFlyToTarget([...displayPosition]);
  });

  const amapEnabled = isAmapApiEnabled();

  // 点位稳定后通过 es-toolkit debounce 防抖逆地理编码补全地址（未配置 key 时整段跳过）
  useEffect(() => {
    if (
      !amapEnabled ||
      disabled ||
      readOnly ||
      !displayPosition ||
      sourceLng === undefined ||
      sourceLat === undefined
    ) {
      return;
    }

    const coordKey = `${sourceLng.toFixed(5)},${sourceLat.toFixed(5)}`;

    // 1. 若当前已有非空地址，无需反查，记录当前点位作为基准跳过
    if (currentValue?.address) {
      lastGeocodedCoordsRef.current = coordKey;
      return;
    }

    // 2. 如果该坐标已经提交过反查，避免重复发起
    if (lastGeocodedCoordsRef.current === coordKey) {
      return;
    }

    lastGeocodedCoordsRef.current = coordKey;
    debouncedRegeoRef.current?.(displayPosition, displayCRS);
  }, [amapEnabled, disabled, readOnly, displayPosition, displayCRS, sourceLng, sourceLat, currentValue?.address]);

  const isPickerBlocked = disabled || readOnly;

  return (
    <div className={cn("flex flex-col gap-2.5 select-none", className)}>
      {showAddressSearch ? (
        <LocationAddressSearch disabled={disabled} readOnly={readOnly} onSelect={handlePlaceSelect} />
      ) : null}

      {/* Map Viewport Area */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs",
          disabled && "pointer-events-none opacity-60",
        )}
        style={{ height }}
      >
        <Map
          center={mapCenter}
          zoom={zoom}
          {...MAP_NO_ATTRIBUTION}
          styles={basemapConfig.styles}
          blank={basemapConfig.blank}
          interactive={!disabled}
          className="size-full"
        >
          <MapAutoResizer />
          <MapFlyTo target={flyToTarget} />
          <MapControls position="bottom-right" showZoom showCompass showLocate onLocate={handleLocate} />
          <MapClickHandler onClick={handleMapPick} disabled={isPickerBlocked} />

          {displayPosition ? (
            <MapMarker
              longitude={displayPosition[0]}
              latitude={displayPosition[1]}
              draggable={!isPickerBlocked}
              onDragEnd={handleMarkerDragEnd}
            >
              <MarkerContent>
                <div className="group relative flex items-center justify-center">
                  <span className="bg-primary/20 absolute -inset-2.5 animate-ping rounded-full" />
                  <div className="border-background bg-primary text-primary-foreground relative flex size-8 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110 active:scale-95">
                    <MapPin className="size-4" />
                  </div>
                </div>
              </MarkerContent>
              <MarkerPopup className="w-56 p-2.5">
                <div className="space-y-1 text-xs">
                  <p className="text-foreground font-semibold">{t("picker_selected_location")}</p>
                  {currentValue?.address ? (
                    <p className="text-muted-foreground leading-tight">{currentValue.address}</p>
                  ) : null}
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {currentValue?.lng.toFixed(5)}, {currentValue?.lat.toFixed(5)}
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
          ) : null}
        </Map>

        {/* Top Hint Pill */}
        {currentValue || isPickerBlocked ? (
          <div className="border-border/80 bg-background/90 pointer-events-none absolute top-3 left-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-md border px-2.5 py-1 text-xs shadow-xs backdrop-blur-md">
            <LocateFixed className="text-primary size-3.5 shrink-0" />
            {isPickerBlocked ? <span className="text-muted-foreground shrink-0">{t("picker_view_only")}</span> : null}
            {currentValue?.address ? (
              <span className="text-foreground/80 min-w-0 truncate">{currentValue.address}</span>
            ) : null}
            {currentValue ? (
              <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
                {currentValue.lng.toFixed(4)}, {currentValue.lat.toFixed(4)}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      {showCoordinatesInput ? (
        <LocationCoordinatesInput
          value={currentValue}
          disabled={disabled}
          readOnly={readOnly}
          showReset={showReset}
          onCoordinatesChange={handleCoordinatesChange}
          onConfirm={handleCoordinatesConfirm}
          onReset={handleReset}
        />
      ) : null}
    </div>
  );
}
