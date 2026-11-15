"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { debounce, type DebouncedFunction } from "es-toolkit";
import { LocateFixed, MapPin } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { cn } from "cn";

import type { LocationPickerProps, LocationPickerValue } from "./types";

import { resolveBasemapConfig } from "../presets/basemaps";
import { DEFAULT_BEIJING_CENTER, MAP_ATTRIBUTION_PROPS } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapFlyTo } from "../shared/MapFlyTo";
import { type CoordinateSystem, getBasemapCRS, isValidCoordinate, transformCoordinates } from "../utils/coordinates";
import { type AmapPlace, reverseGeocode } from "./amapGeo";
import { LocationAddressSearch } from "./LocationAddressSearch";
import { LocationCoordinatesInput } from "./LocationCoordinatesInput";
import { MapClickHandler } from "./MapClickHandler";
import { useGeocodeProxyAvailability } from "./useGeocodeProxyAvailability";

const REVERSE_GEOCODE_DEBOUNCE_MS = 450;

export const LocationPicker = memo(function LocationPicker({
  coordinateSystem: sourceCRS = "WGS84",
  value,
  defaultValue,
  onChange,
  disabled = false,
  readOnly = false,
  showCoordinatesInput = true,
  showAddressSearch = true,
  showReset = true,
  searchPlaceholder,
  height = 320,
  center,
  zoom = 12,
  basemap = "amap",
  customStyleUrl,
  className,
  externalInteractionEpoch = 0,
}: LocationPickerProps) {
  const t = useTranslations("map");

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
    sourceLng !== undefined && sourceLat !== undefined ? `${sourceLng.toFixed(5)},${sourceLat.toFixed(5)}` : "";

  const displayPosition = useMemo<[number, number] | undefined>(() => {
    if (sourceLng === undefined || sourceLat === undefined) return undefined;
    return transformCoordinates([sourceLng, sourceLat], sourceCRS, displayCRS);
  }, [sourceLng, sourceLat, sourceCRS, displayCRS]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (displayPosition) return displayPosition;
    if (isValidCoordinate(center)) return center;
    return DEFAULT_BEIJING_CENTER;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  const [flyToTarget, setFlyToTarget] = useState<[number, number] | undefined>(undefined);
  const fromMapInteractionRef = useRef(false);
  /**
   * 记录用户是否已产生交互变更（点击/拖拽/输入/搜索）：
   * 仅挂载时对缺失 address 的初始值执行本地逆地理展示丰富，绝不调用 onChange 污染表单 dirty 状态。
   */
  const hasUserInteractedRef = useRef(externalInteractionEpoch > 0);
  const [localDisplayAddress, setLocalDisplayAddress] = useState<{ coordKey: string; address: string } | null>(null);

  useEffect(() => {
    if (externalInteractionEpoch > 0) {
      hasUserInteractedRef.current = true;
      setLocalDisplayAddress(null);
    }
  }, [externalInteractionEpoch]);

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!displayPosition) {
      fromMapInteractionRef.current = false;
      setFlyToTarget(undefined);
      return;
    }

    if (fromMapInteractionRef.current) {
      fromMapInteractionRef.current = false;
      return;
    }

    setFlyToTarget([...displayPosition]);
  }, [displayPosition]);

  const commitPosition = useMemoizedFn(
    (lngLat: [number, number], fromCRS: CoordinateSystem, address?: string | null) => {
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

      if (!isControlled) setInternalValue(updated);
      onChange?.(updated);
    },
  );

  const commitAddress = useMemoizedFn((address: string, targetCoordKey: string) => {
    if (disabled || readOnly || !currentValue) return;
    if (currentValue.address === address) return;

    if (!hasUserInteractedRef.current) {
      // 初始挂载无用户操作时，只补充展示用本地地址，避免触发上游表单 isDirty
      setLocalDisplayAddress({ coordKey: targetCoordKey, address });
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
    fromMapInteractionRef.current = true;
    commitPosition([coords.lng, coords.lat], displayCRS, null);
  });

  const handleMarkerDragEnd = useMemoizedFn((lngLat: { lng: number; lat: number }) => {
    fromMapInteractionRef.current = true;
    commitPosition([lngLat.lng, lngLat.lat], displayCRS, null);
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
    const coordKey = `${place.lngLat[0].toFixed(5)},${place.lngLat[1].toFixed(5)}`;
    lastGeocodedCoordsRef.current = coordKey;
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
    setLocalDisplayAddress(null);
    debouncedRegeoRef.current?.cancel();
    regeoAbortControllerRef.current?.abort();
    lastGeocodedCoordsRef.current = null;
    if (!isControlled) setInternalValue(defaultValue);
    onChange?.(defaultValue as LocationPickerValue);
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
    (localDisplayAddress?.coordKey === currentCoordKey ? localDisplayAddress.address : undefined);
  const isPickerBlocked = disabled || readOnly;

  return (
    <div className={cn("flex flex-col gap-2.5 select-none", className)}>
      {showAddressSearch ? (
        <LocationAddressSearch
          disabled={disabled}
          readOnly={readOnly}
          placeholder={searchPlaceholder}
          onSelect={handlePlaceSelect}
        />
      ) : null}

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
          {...MAP_ATTRIBUTION_PROPS}
          styles={basemapConfig.styles}
          blank={basemapConfig.blank}
          interactive={!disabled}
          className="size-full"
        >
          <MapAutoResizer />
          <MapFlyTo target={flyToTarget ?? null} />
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
                  {effectiveAddress ? <p className="text-muted-foreground leading-tight">{effectiveAddress}</p> : null}
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {currentValue?.lng.toFixed(5)}, {currentValue?.lat.toFixed(5)}
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
          ) : null}
        </Map>

        {hasValidCurrentValue || isPickerBlocked ? (
          <div className="border-border/80 bg-background/90 pointer-events-none absolute top-3 left-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-md border px-2.5 py-1 text-xs shadow-xs backdrop-blur-md">
            <LocateFixed className="text-primary size-3.5 shrink-0" />
            {isPickerBlocked ? <span className="text-muted-foreground shrink-0">{t("picker_view_only")}</span> : null}
            {effectiveAddress ? <span className="text-foreground/80 min-w-0 truncate">{effectiveAddress}</span> : null}
            {hasValidCurrentValue && currentValue ? (
              <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
                {currentValue.lng.toFixed(4)}, {currentValue.lat.toFixed(4)}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      {showCoordinatesInput ? (
        <LocationCoordinatesInput
          value={hasValidCurrentValue ? currentValue : undefined}
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
});
