import * as React from "react";

import type { InfolistContextValue } from "./types";

const InfolistContext = React.createContext<InfolistContextValue | null>(null);

/** 无 Provider 时的稳定兜底值，避免每次调用返回新对象 */
const EMPTY_CONTEXT: InfolistContextValue = {};

/** 缓存解析后的属性路径数组，避免每次渲染都运行正则和字符串切割 */
const PATH_CACHE = new Map<string, string[]>();

export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object" || !path) return undefined;

  let parts = PATH_CACHE.get(path);
  if (!parts) {
    parts = path.replace(/\[(\w+)\]/g, ".$1").split(".");
    if (PATH_CACHE.size < 500) {
      PATH_CACHE.set(path, parts);
    }
  }

  let current: unknown = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function InfolistProvider({
  record,
  orientation = "vertical",
  dense = false,
  children,
}: InfolistContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ record, orientation, dense }), [record, orientation, dense]);

  return <InfolistContext value={value}>{children}</InfolistContext>;
}

export function useInfolistContext<TRecord = unknown>(): InfolistContextValue<TRecord> {
  const context = React.useContext(InfolistContext);
  return (context as InfolistContextValue<TRecord>) ?? EMPTY_CONTEXT;
}

export function useInfolistFieldValue<T = unknown>(name?: string, explicitValue?: T): T | undefined {
  const { record } = useInfolistContext();

  if (explicitValue !== undefined) {
    return explicitValue;
  }

  if (name && record) {
    return getNestedValue(record, name) as T | undefined;
  }

  return undefined;
}
