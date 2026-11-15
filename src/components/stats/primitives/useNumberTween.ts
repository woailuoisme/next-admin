"use client";

import { useEffect, useRef, useState } from "react";

interface UseNumberTweenOptions {
  /** Duration of the animation in milliseconds (default: 600ms) */
  duration?: number;
  /** Whether animation is enabled (default: true) */
  enabled?: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function getDecimalPrecision(value: number): number {
  if (!Number.isFinite(value) || Number.isInteger(value)) {
    return 0;
  }
  const str = String(value);
  const dotIdx = str.indexOf(".");
  if (dotIdx === -1) return 0;
  return Math.min(4, str.length - dotIdx - 1);
}

/**
 * Zero-dependency lightweight RAF number tween hook.
 * Only subscribes to `prefers-reduced-motion` when `enabled === true`,
 * and preserves target decimal precision during intermediate frames.
 */
export function useNumberTween(
  targetValue: number,
  { duration = 600, enabled = true }: UseNumberTweenOptions = {},
): number {
  const safeTarget = Number.isFinite(targetValue) ? targetValue : 0;
  const [current, setCurrent] = useState<number>(safeTarget);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const startValRef = useRef<number>(safeTarget);
  const latestValRef = useRef<number>(safeTarget);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, [enabled]);

  const isDirect = !enabled || prefersReducedMotion || duration <= 0 || !Number.isFinite(targetValue);

  useEffect(() => {
    let cancelled = false;

    if (isDirect) {
      startValRef.current = safeTarget;
      latestValRef.current = safeTarget;
      queueMicrotask(() => {
        if (!cancelled) {
          setCurrent((prev) => (prev === safeTarget ? prev : safeTarget));
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const startVal = startValRef.current;
    const diff = safeTarget - startVal;

    if (!Number.isFinite(diff) || diff === 0) {
      startValRef.current = safeTarget;
      latestValRef.current = safeTarget;
      queueMicrotask(() => {
        if (!cancelled) {
          setCurrent((prev) => (prev === safeTarget ? prev : safeTarget));
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const decimals = getDecimalPrecision(safeTarget);
    const factor = decimals === 0 ? 1 : 10 ** decimals;
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const rawNext = startVal + diff * easedProgress;
      const nextVal = decimals === 0 ? Math.round(rawNext) : Math.round(rawNext * factor) / factor;
      latestValRef.current = nextVal;
      setCurrent(nextVal);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        latestValRef.current = safeTarget;
        setCurrent(safeTarget);
        startValRef.current = safeTarget;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      startValRef.current = latestValRef.current;
    };
  }, [safeTarget, duration, isDirect]);

  return isDirect ? safeTarget : current;
}
