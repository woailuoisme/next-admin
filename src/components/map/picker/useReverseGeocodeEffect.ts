"use client";

import { useMemoizedFn } from "ahooks";
import { debounce, type DebouncedFunction } from "es-toolkit";
import { useEffect, useRef } from "react";

import { type CoordinateSystem, transformCoordinates } from "../utils/coordinates";
import { reverseGeocode } from "./amapGeo";

const REVERSE_GEOCODE_DEBOUNCE_MS = 450;

export function formatLocationCoordKey(pos: readonly [number, number]): string {
  return `${pos[0].toFixed(5)},${pos[1].toFixed(5)}`;
}

interface UseReverseGeocodeEffectOptions {
  amapEnabled: boolean;
  disabled: boolean;
  readOnly: boolean;
  displayPosition?: [number, number];
  displayCRS: CoordinateSystem;
  sourceLng?: number;
  sourceLat?: number;
  currentCoordKey: string;
  currentAddress?: string;
  onAddressResolved: (address: string, coordKey: string) => void;
}

export function useReverseGeocodeEffect({
  amapEnabled,
  disabled,
  readOnly,
  displayPosition,
  displayCRS,
  sourceLng,
  sourceLat,
  currentCoordKey,
  currentAddress,
  onAddressResolved,
}: UseReverseGeocodeEffectOptions) {
  const regeoAbortControllerRef = useRef<AbortController | null>(null);
  const debouncedRegeoRef = useRef<DebouncedFunction<
    (pos: [number, number], crs: CoordinateSystem, key: string) => void
  > | null>(null);
  const lastGeocodedCoordsRef = useRef<string | null>(null);

  useEffect(() => {
    const debounced = debounce(async (pos: [number, number], crs: CoordinateSystem, key: string) => {
      regeoAbortControllerRef.current?.abort();
      const controller = new AbortController();
      regeoAbortControllerRef.current = controller;

      const gcjPosition = transformCoordinates(pos, crs, "GCJ02");
      const address = await reverseGeocode(gcjPosition, controller.signal);
      if (controller.signal.aborted || !address) return;
      onAddressResolved(address, key);
    }, REVERSE_GEOCODE_DEBOUNCE_MS);

    debouncedRegeoRef.current = debounced;
    return () => {
      debounced.cancel();
      regeoAbortControllerRef.current?.abort();
    };
  }, [onAddressResolved]);

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

    if (currentAddress) {
      lastGeocodedCoordsRef.current = currentCoordKey;
      return;
    }

    if (lastGeocodedCoordsRef.current === currentCoordKey) return;

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
    currentAddress,
  ]);

  const cancelPendingRegeo = useMemoizedFn((nextCoordKey?: string | null) => {
    debouncedRegeoRef.current?.cancel();
    regeoAbortControllerRef.current?.abort();
    lastGeocodedCoordsRef.current = nextCoordKey ?? null;
  });

  return { cancelPendingRegeo };
}
