"use client";

import { useMemoizedFn } from "ahooks";
import { useMemo, useRef, useState } from "react";

import { resolveBasemapConfig } from "../presets/basemaps";
import { DEFAULT_BEIJING_CENTER } from "../shared/constants";
import { type CoordinateSystem, getBasemapCRS, isValidCoordinate, transformCoordinates } from "../utils/coordinates";
import type { AmapPlace } from "./amapGeo";
import type { LocationPickerProps, LocationPickerValue } from "./types";
import { useGeocodeProxyAvailability } from "./useGeocodeProxyAvailability";
import { formatLocationCoordKey, useReverseGeocodeEffect } from "./useReverseGeocodeEffect";

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
 * 统一托管受控/非受控坐标、底图坐标系双向转换、防抖逆地理编码与飞往视口状态。
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
    sourceLng !== undefined && sourceLat !== undefined ? formatLocationCoordKey([sourceLng, sourceLat]) : "";

  const displayPosition = useMemo<[number, number] | undefined>(() => {
    if (sourceLng === undefined || sourceLat === undefined) return undefined;
    return transformCoordinates([sourceLng, sourceLat], sourceCRS, displayCRS);
  }, [sourceLng, sourceLat, sourceCRS, displayCRS]);

  const displayCoordKey = displayPosition ? formatLocationCoordKey(displayPosition) : "";

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
    if (!displayPosition) setFlyToTarget(undefined);
    else if (suppressedFlyKey !== displayCoordKey) setFlyToTarget([...displayPosition]);
  }

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
      if (address !== undefined) updated.address = address ?? undefined;

      if (suppressFly) {
        const nextDisplayPos = transformCoordinates([updated.lng, updated.lat], sourceCRS, displayCRS);
        setSuppressedFlyKey(formatLocationCoordKey(nextDisplayPos));
      } else {
        setSuppressedFlyKey(null);
      }

      if (!isControlled) setInternalValue(updated);
      onChange?.(updated);
    },
  );

  const commitAddress = useMemoizedFn((address: string, targetCoordKey: string) => {
    if (disabled || readOnly || !currentValue || currentValue.address === address) return;

    if (!hasUserInteractedRef.current && externalInteractionEpoch <= 0) {
      setLocalDisplayAddress({ epoch: externalInteractionEpoch, coordKey: targetCoordKey, address });
      return;
    }

    const updated: LocationPickerValue = { ...currentValue, address };
    if (!isControlled) setInternalValue(updated);
    onChange?.(updated);
  });

  const { cancelPendingRegeo } = useReverseGeocodeEffect({
    amapEnabled,
    disabled,
    readOnly,
    displayPosition,
    displayCRS,
    sourceLng,
    sourceLat,
    currentCoordKey,
    currentAddress: currentValue?.address,
    onAddressResolved: commitAddress,
  });

  const handleMapPick = useMemoizedFn((coords: { lng: number; lat: number }) => {
    commitPosition([coords.lng, coords.lat], displayCRS, null, true);
  });

  const handleMarkerDragEnd = useMemoizedFn((lngLat: { lng: number; lat: number }) => {
    commitPosition([lngLat.lng, lngLat.lat], displayCRS, null, true);
  });

  const handlePlaceSelect = useMemoizedFn((place: AmapPlace) => {
    cancelPendingRegeo(formatLocationCoordKey(place.lngLat));
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
    cancelPendingRegeo(null);
    if (!isControlled) setInternalValue(defaultValue);
    if (defaultValue) onChange?.(defaultValue);

    const hasDefaultPos = defaultValue && isValidCoordinate([defaultValue.lng, defaultValue.lat]);
    const resetTarget = hasDefaultPos
      ? transformCoordinates([defaultValue.lng, defaultValue.lat], sourceCRS, displayCRS)
      : fallbackMapCenter;
    setFlyToTarget([...resetTarget]);
  });

  const handleCoordinatesConfirm = useMemoizedFn(() => {
    if (displayPosition) setFlyToTarget([...displayPosition]);
  });

  const effectiveAddress =
    currentValue?.address ||
    (localDisplayAddress?.epoch === externalInteractionEpoch && localDisplayAddress.coordKey === currentCoordKey
      ? localDisplayAddress.address
      : undefined);

  return {
    basemapConfig,
    mapCenter,
    flyToTarget,
    displayPosition,
    currentValue,
    hasValidCurrentValue,
    effectiveAddress,
    isPickerBlocked: disabled || readOnly,
    handleMapPick,
    handleMarkerDragEnd,
    handlePlaceSelect,
    handleCoordinatesChange,
    handleCoordinatesConfirm,
    handleLocate,
    handleReset,
  };
}
