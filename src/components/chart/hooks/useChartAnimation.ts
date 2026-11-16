"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeNoop() {
  return () => {};
}

function getFalseSnapshot() {
  return false;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Resolve effective chart animation flag while respecting OS `prefers-reduced-motion`.
 * Only subscribes to media query changes when `isAnimationActive` is `true`.
 */
export function useChartAnimation(isAnimationActive = true): boolean {
  const prefersReducedMotion = useSyncExternalStore(
    isAnimationActive ? subscribeReducedMotion : subscribeNoop,
    isAnimationActive ? getReducedMotionSnapshot : getFalseSnapshot,
    getFalseSnapshot,
  );
  return isAnimationActive && !prefersReducedMotion;
}
