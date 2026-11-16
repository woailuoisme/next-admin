"use client";

import { useMemoizedFn } from "ahooks";
import { debounce, type DebouncedFunction } from "es-toolkit";
import { useEffect, useMemo, useRef, useState } from "react";

import type { LocationPickerProps, LocationPickerValue } from "./types";

import { resolveBasemapConfig } from "../presets/basemaps";
import { DEFAULT_BEIJING_CENTER } from "../shared/constants";
import { type CoordinateSystem, getBasemapCRS, isValidCoordinate, transformCoordinates } from "../utils/coordinates";
import { type AmapPlace, reverseGeocode } from "./amapGeo";
import { useGeocodeProxyAvailability } from "./useGeocodeProxyAvailability";

const REVERSE_GEOCODE_DEBOUNCE_MS = 450;

function formatCoordKey(pos: readonly [number, number]): string {
  return `${pos[0].toFixed(5)},${pos[1].toFixed(5)}`;
}

type UseLocationPickerOptions = Pick<
  LocationPickerProps,
  | "coordinateSystem"
  | "value"
  | "defaultValue"
  | "onChange"
  | "disabled"
  | "readOnly"
  | "center"
  | "basemap"
  | "customStyleUrl"
  | "externalInteractionEpoch"
>;

/**
 * 位置选择器核心状态机：
 * - 统一托管受控/非受控坐标、底图坐标系双向转换；
 * - 防抖调用逆地理编码补充地址，并隔离首次挂载的本地展示与用户交互回传；
 * - 管理外部受控更新后的视角飞往目标（`flyToTarget`）。
 */
export function useLocationPicker({
  coordinateSystem: sourceCRS = "WGS84",
  value,
  defaultValue,
  onChange,
  disabled = false,
  readOnly = false,
  center,
  basemap = "amap",
  customStyleUrl,
  externalInteractionEpoch = 0,
}: UseLocationPickerOptions) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<LocationPickerValue | undefined>(defaultValue);
  const currentValue = isControlled ? value : internalValue;
  const hasValidCurrentValue = Boolean(currentValue && isValidCoordinate([currentValue.lng, currentValue.lat]));

  const amapEnabled = useGeocodeProxyAvailability();

  const basemapConfig = useMemo(() => {
    const customStyles = customStyleUrl?.light || customStyleUrl?.dark ? customStyleUrl : undefined;
    return resolveBasemapConfig(basemap, customStyles);
  }, [basemap, customStyleUrl]);

  const displayCRS = useMemo(() => getBasemapCRS(basemap), [basemap]);

  const sourceLng = hasValidCurrentValue ? currentValue?.lng : undefined;
  const sourceLat = hasValidCurrentValue ? currentValue?.lat : undefined;
  const currentCoordKey =
    sourceLng !== undefined && sourceLat !== undefined ? formatCoordKey([sourceLng, sourceLat]) : "";

  const displayPosition = useMemo<[number, number] | undefined>(() => {
    if (sourceLng === undefined || sourceLat === undefined) return undefined;
    return transformCoordinates([sourceLng, sourceLat], sourceCRS, displayCRS);
  }, [sourceLng, sourceLat, sourceCRS, displayCRS]);

  const displayCoordKey = displayPosition ? formatCoordKey(displayPosition) : "";

  const fallbackMapCenter = useMemo<[number, number]>(
    () => (isValidCoordinate(center) ? center : DEFAULT_BEIJING_CENTER),
    [center],
  );
  const [mapCenter] = useState<[number, number]>(() => displayPosition ?? fallbackMapCenter);

  const [flyToTarget, setFlyToTarget] = useState<[number, number] | undefined>(undefined);
  const [prevDisplayCoordKey, setPrevDisplayCoordKey] = useState(displayCoordKey);
  const [suppressedFlyKey, setSuppressedFlyKey] = useState<string | null>(null);

  if (displayCoordKey !== prevDisplayCoordKey) {
    setPrevDisplayCoordKey(displayCoordKey);
    if (!displayPosition) {
      setFlyToTarget(undefined);
    } else if (suppressedFlyKey !== displayCoordKey) {
      setFlyToTarget([...displayPosition]);
    }
  }

  /**
   * 记录用户是否已产生交互变更（点击/拖拽/输入/搜索）：
   * 仅挂载时对缺失 address 的初始值执行本地逆地理展示丰富，绝不调用 onChange 污染表单 dirty 状态。
   */
  const hasUserInteractedRef = useRef(externalInteractionEpoch > 0);
  const [localDisplayAddress, setLocalDisplayAddress] = useState<{
    epoch: number;
    coordKey: string;
    address: string;
  } | null>(null);

  const commitPosition = useMemoizedFn(
    (lngLat: [number, number], fromCRS: CoordinateSystem, address?: string | null, suppressFly = false) => {
      if (disabled || readOnly) return;

      hasUserInteractedRef.current = true;
      setLocalDisplayAddress(null);
      const [lng, lat] = transformCoordinates(lngLat, fromCRS, sourceCRS);
      const updated: LocationPickerValue = {
        ...currentValue,
        lng: Number(lng.toFixed(6)),
        lat: Number(lat.toFixed(6)),
      };
      if (address !== undefined) {
        updated.address = address ?? undefined;
      }

      if (suppressFly) {
        const nextDisplayPos = transformCoordinates([updated.lng, updated.lat], sourceCRS, displayCRS);
        setSuppressedFlyKey(formatCoordKey(nextDisplayPos));
      } else {
        setSuppressedFlyKey(null);
      }

      if (!isControlled) setInternalValue(updated);
      onChange?.(updated);
    },
  );

  const commitAddress = useMemoizedFn((address: string, targetCoordKey: string) => {
    if (disabled || readOnly || !currentValue) return;
    if (currentValue.address === address) return;

    if (!hasUserInteractedRef.current && externalInteractionEpoch <= 0) {
      // 初始挂载无用户操作时，只补充展示用本地地址，避免触发上游表单 isDirty
      setLocalDisplayAddress({ epoch: externalInteractionEpoch, coordKey: targetCoordKey, address });
      return;
    }

    const updated: LocationPickerValue = {
      ...currentValue,
      address,
    };

    if (!isControlled) setInternalValue(updated);
    onChange?.(updated);
  });

  const handleMapPick = useMemoizedFn((coords: { lng: number; lat: number }) => {
    commitPosition([coords.lng, coords.lat], displayCRS, null, true);
  });

  const handleMarkerDragEnd = useMemoizedFn((lngLat: { lng: number; lat: number }) => {
    commitPosition([lngLat.lng, lngLat.lat], displayCRS, null, true);
  });

  const regeoAbortControllerRef = useRef<AbortController | null>(null);
  const debouncedRegeoRef = useRef<DebouncedFunction<
    (pos: [number, number], crs: CoordinateSystem, key: string) => void
  > | null>(null);

  useEffect(() => {
    const debounced = debounce(async (pos: [number, number], crs: CoordinateSystem, key: string) => {
      regeoAbortControllerRef.current?.abort();
      const controller = new AbortController();
      regeoAbortControllerRef.current = controller;

      const gcjPosition = transformCoordinates(pos, crs, "GCJ02");
      const address = await reverseGeocode(gcjPosition, controller.signal);
      if (controller.signal.aborted || !address) return;
      commitAddress(address, key);
    }, REVERSE_GEOCODE_DEBOUNCE_MS);

    debouncedRegeoRef.current = debounced;

    return () => {
      debounced.cancel();
      regeoAbortControllerRef.current?.abort();
    };
  }, [commitAddress]);

  const lastGeocodedCoordsRef = useRef<string | null>(null);

  const handlePlaceSelect = useMemoizedFn((place: AmapPlace) => {
    debouncedRegeoRef.current?.cancel();
    regeoAbortControllerRef.current?.abort();
    lastGeocodedCoordsRef.current = formatCoordKey(place.lngLat);
    commitPosition(place.lngLat, "GCJ02", place.address || place.name);
  });

  const handleCoordinatesChange = useMemoizedFn((coords: { lng: number; lat: number }) => {
    commitPosition([coords.lng, coords.lat], sourceCRS, null);
  });

  const handleLocate = useMemoizedFn((coords: { longitude: number; latitude: number }) => {
    commitPosition([coords.longitude, coords.latitude], "WGS84", null);
  });

  const handleReset = useMemoizedFn(() => {
    if (disabled || readOnly) return;
    hasUserInteractedRef.current = true;
    setSuppressedFlyKey(null);
    setLocalDisplayAddress(null);
    debouncedRegeoRef.current?.cancel();
    regeoAbortControllerRef.current?.abort();
    lastGeocodedCoordsRef.current = null;
    if (!isControlled) setInternalValue(defaultValue);
    if (defaultValue) {
      onChange?.(defaultValue);
    }

    const hasDefaultPos = defaultValue && isValidCoordinate([defaultValue.lng, defaultValue.lat]);
    const resetTarget = hasDefaultPos
      ? transformCoordinates([defaultValue.lng, defaultValue.lat], sourceCRS, displayCRS)
      : fallbackMapCenter;
    setFlyToTarget([...resetTarget]);
  });

  const handleCoordinatesConfirm = useMemoizedFn(() => {
    if (displayPosition) setFlyToTarget([...displayPosition]);
  });

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

    if (currentValue?.address) {
      lastGeocodedCoordsRef.current = currentCoordKey;
      return;
    }

    if (lastGeocodedCoordsRef.current === currentCoordKey) {
      return;
    }

    lastGeocodedCoordsRef.current = currentCoordKey;
    debouncedRegeoRef.current?.(displayPosition, displayCRS, currentCoordKey);
  }, [
    amapEnabled,
    disabled,
    readOnly,
    displayPosition,
    displayCRS,
    sourceLng,
    sourceLat,
    currentCoordKey,
    currentValue?.address,
  ]);

  const effectiveAddress =
    currentValue?.address ||
    (localDisplayAddress?.epoch === externalInteractionEpoch && localDisplayAddress.coordKey === currentCoordKey
      ? localDisplayAddress.address
      : undefined);
  const isPickerBlocked = disabled || readOnly;

  return {
    basemapConfig,
    mapCenter,
    flyToTarget,
    displayPosition,
    currentValue,
    hasValidCurrentValue,
    effectiveAddress,
    isPickerBlocked,
    handleMapPick,
    handleMarkerDragEnd,
    handlePlaceSelect,
    handleCoordinatesChange,
    handleCoordinatesConfirm,
    handleLocate,
    handleReset,
  };
}
