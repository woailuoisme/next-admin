import { useEffect, useRef, useState } from "react";

interface UseNumberTweenOptions {
  /** Duration of the animation in milliseconds (default: 600ms) */
  duration?: number;
  /** Whether animation is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Cubic ease-out easing curve for natural deceleration
 */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Zero-dependency lightweight RAF number tween hook with prefers-reduced-motion support.
 */
export function useNumberTween(
  targetValue: number,
  { duration = 600, enabled = true }: UseNumberTweenOptions = {},
): number {
  const [current, setCurrent] = useState<number>(targetValue);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const startValRef = useRef<number>(targetValue);
  const latestValRef = useRef<number>(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  const isDirect = !enabled || prefersReducedMotion || duration <= 0;

  useEffect(() => {
    if (isDirect) {
      startValRef.current = targetValue;
      latestValRef.current = targetValue;
      return;
    }

    const startVal = startValRef.current;
    const diff = targetValue - startVal;

    if (diff === 0) {
      return;
    }

    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const nextVal = Math.round(startVal + diff * easedProgress);
      latestValRef.current = nextVal;
      setCurrent(nextVal);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        latestValRef.current = targetValue;
        setCurrent(targetValue);
        startValRef.current = targetValue;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      startValRef.current = latestValRef.current;
    };
  }, [targetValue, duration, isDirect]);

  return isDirect ? targetValue : current;
}
