"use client";

import { useEffect, useState } from "react";

import { isAmapApiEnabled, probeGeocodeProxy } from "./amapGeo";

/**
 * 探测服务端 `/api/geocode` 代理或内置适配器的可用状态，
 * 在高德地理编码客户端组件（地址搜索栏与选点器）间共享同一探测生命周期。
 */
export function useGeocodeProxyAvailability(): boolean {
  const [proxyDetected, setProxyDetected] = useState(() => isAmapApiEnabled());

  useEffect(() => {
    if (isAmapApiEnabled()) return;
    let cancelled = false;
    const controller = new AbortController();
    probeGeocodeProxy(controller.signal).then((enabled) => {
      if (!cancelled && enabled) {
        setProxyDetected(true);
      }
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return isAmapApiEnabled() || proxyDetected;
}
