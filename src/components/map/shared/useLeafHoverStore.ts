"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export interface LeafHoverStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T | null;
  getServerSnapshot: () => null;
}

/**
 * 叶子悬浮状态 Store：将鼠标悬停高频变化隔离在独立展示叶子内，
 * 避免父级地图树与图层控件随鼠标移动重复重渲染。
 */
export function useLeafHoverStore<T>(isSame?: (prev: T | null, next: T | null) => boolean): {
  store: LeafHoverStore<T>;
  setHovered: (next: T | null) => void;
} {
  const hoverRef = useRef<T | null>(null);
  const listenersRef = useRef(new Set<() => void>());
  const isSameRef = useRef(isSame);
  useEffect(() => {
    isSameRef.current = isSame;
  }, [isSame]);

  const store = useMemo<LeafHoverStore<T>>(
    () => ({
      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getSnapshot: () => hoverRef.current,
      getServerSnapshot: () => null,
    }),
    [],
  );

  const setHovered = useCallback((next: T | null) => {
    const prev = hoverRef.current;
    if (isSameRef.current ? isSameRef.current(prev, next) : prev === next) {
      return;
    }
    hoverRef.current = next;
    for (const listener of listenersRef.current) {
      listener();
    }
  }, []);

  return { store, setHovered };
}
