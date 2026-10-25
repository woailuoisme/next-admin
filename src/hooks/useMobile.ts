import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY);
}

function subscribe(callback: () => void) {
  const mql = getMediaQueryList();
  if (!mql) return () => {};
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  const mql = getMediaQueryList();
  if (mql) {
    return mql.matches;
  }
  return typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
