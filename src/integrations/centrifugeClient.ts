"use client";

import { Centrifuge, type ConnectedContext, type DisconnectedContext } from "centrifuge";

export const CENTRIFUGE_WS_URL =
  process.env.NEXT_PUBLIC_CENTRIFUGE_WS_URL || "ws://localhost:48000/connection/websocket";

let centrifugeInstance: Centrifuge | null = null;
let connectStartTime = 0;
let lastMeasuredRtt = 0;

export interface RealtimeStatusState {
  state: "connected" | "connecting" | "disconnected";
  isConnected: boolean;
  rtt: number;
  wsUrl: string;
}

const statusListeners = new Set<() => void>();

function notifyStatusChange() {
  if (typeof window === "undefined") return;
  queueMicrotask(() => {
    statusListeners.forEach((listener) => listener());
  });
}

const serverStatusSnapshot: RealtimeStatusState = {
  state: "disconnected",
  isConnected: false,
  rtt: 0,
  wsUrl: CENTRIFUGE_WS_URL,
};

let currentStatusSnapshot: RealtimeStatusState = serverStatusSnapshot;

export function syncCentrifugeSnapshot(nextRtt?: number) {
  const state = (centrifugeInstance?.state as "connected" | "connecting" | "disconnected") || "disconnected";
  // 未实测过就是 0（UI 显示 "—"），不伪造延迟数字
  const rtt = nextRtt !== undefined ? nextRtt : lastMeasuredRtt;
  const isConnected = state === "connected";

  if (
    currentStatusSnapshot.state !== state ||
    currentStatusSnapshot.isConnected !== isConnected ||
    currentStatusSnapshot.rtt !== rtt ||
    currentStatusSnapshot.wsUrl !== CENTRIFUGE_WS_URL
  ) {
    currentStatusSnapshot = { state, isConnected, rtt, wsUrl: CENTRIFUGE_WS_URL };
    notifyStatusChange();
  }
}

export function subscribeToCentrifugeStatus(onStoreChange: () => void) {
  statusListeners.add(onStoreChange);
  return () => {
    statusListeners.delete(onStoreChange);
  };
}

export function getCentrifugeStatusSnapshot(): RealtimeStatusState {
  return currentStatusSnapshot;
}

export function getCentrifugeServerSnapshot(): RealtimeStatusState {
  return serverStatusSnapshot;
}

export function markConnectStart() {
  connectStartTime = performance.now();
}

export async function measureCentrifugeRtt(): Promise<number> {
  const start = performance.now();
  try {
    const res = await fetch("/api/realtime/token", { method: "HEAD", cache: "no-store" });
    if (res.ok) {
      const val = Math.max(1, Math.round(performance.now() - start));
      lastMeasuredRtt = val;
      syncCentrifugeSnapshot(val);
      return val;
    }
  } catch {}
  return lastMeasuredRtt;
}

export function getCentrifuge(): Centrifuge | null {
  if (typeof window === "undefined") return null;

  if (!centrifugeInstance) {
    try {
      centrifugeInstance = new Centrifuge(CENTRIFUGE_WS_URL, {
        name: "admin-panel-web",
        minReconnectDelay: 1000,
        maxReconnectDelay: 10000,
        getToken: async () => {
          const res = await fetch("/api/realtime/token");
          if (!res.ok) {
            throw new Error(`Token HTTP error ${res.status}`);
          }
          const data = (await res.json()) as { token: string };
          return data.token;
        },
      });

      centrifugeInstance.on("connecting", () => {
        connectStartTime = performance.now();
        syncCentrifugeSnapshot();
      });

      centrifugeInstance.on("connected", (_ctx: ConnectedContext) => {
        if (connectStartTime > 0) {
          lastMeasuredRtt = Math.max(1, Math.round(performance.now() - connectStartTime));
        }
        syncCentrifugeSnapshot();
      });

      centrifugeInstance.on("disconnected", (_ctx: DisconnectedContext) => {
        syncCentrifugeSnapshot();
      });

      centrifugeInstance.on("error", (err) => {
        console.warn("[Centrifuge] Client error:", err);
        syncCentrifugeSnapshot();
      });

      connectStartTime = performance.now();
      centrifugeInstance.connect();
      syncCentrifugeSnapshot();
    } catch (e) {
      console.warn("[Centrifuge] Failed to init centrifuge:", e);
    }
  }

  return centrifugeInstance;
}
