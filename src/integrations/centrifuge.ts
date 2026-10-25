"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useLatest } from "ahooks";
import {
  Centrifuge,
  type ConnectedContext,
  type DisconnectedContext,
  type JoinContext,
  type LeaveContext,
  type PublicationContext,
} from "centrifuge";

const WS_URL = process.env.NEXT_PUBLIC_CENTRIFUGE_WS_URL || "ws://localhost:48000/connection/websocket";

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
  wsUrl: WS_URL,
};

let currentStatusSnapshot: RealtimeStatusState = serverStatusSnapshot;

function syncSnapshot(nextRtt?: number) {
  const state = (centrifugeInstance?.state as "connected" | "connecting" | "disconnected") || "disconnected";
  // 未实测过就是 0（UI 显示 "—"），不伪造延迟数字
  const rtt = nextRtt !== undefined ? nextRtt : lastMeasuredRtt;
  const isConnected = state === "connected";

  if (
    currentStatusSnapshot.state !== state ||
    currentStatusSnapshot.isConnected !== isConnected ||
    currentStatusSnapshot.rtt !== rtt ||
    currentStatusSnapshot.wsUrl !== WS_URL
  ) {
    currentStatusSnapshot = {
      state,
      isConnected,
      rtt,
      wsUrl: WS_URL,
    };
    notifyStatusChange();
  }
}

function subscribeToStatus(onStoreChange: () => void) {
  statusListeners.add(onStoreChange);
  return () => {
    statusListeners.delete(onStoreChange);
  };
}

function getStatusSnapshot(): RealtimeStatusState {
  return currentStatusSnapshot;
}

function getServerStatusSnapshot(): RealtimeStatusState {
  return serverStatusSnapshot;
}

export function getCentrifuge(): Centrifuge | null {
  if (typeof window === "undefined") return null;

  if (!centrifugeInstance) {
    try {
      centrifugeInstance = new Centrifuge(WS_URL, {
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
        syncSnapshot();
      });

      centrifugeInstance.on("connected", (_ctx: ConnectedContext) => {
        if (connectStartTime > 0) {
          lastMeasuredRtt = Math.max(1, Math.round(performance.now() - connectStartTime));
        }
        syncSnapshot();
      });

      centrifugeInstance.on("disconnected", (_ctx: DisconnectedContext) => {
        syncSnapshot();
      });

      centrifugeInstance.on("error", (err) => {
        console.warn("[Centrifuge] Client error:", err);
        syncSnapshot();
      });

      // Automatically initiate connection
      connectStartTime = performance.now();
      centrifugeInstance.connect();
      syncSnapshot();
    } catch (e) {
      console.warn("[Centrifuge] Failed to init centrifuge:", e);
    }
  }

  return centrifugeInstance;
}

export function useCentrifugeStatus(): RealtimeStatusState & {
  centrifuge: Centrifuge | null;
  reconnect: () => void;
  disconnect: () => void;
  measureRtt: () => Promise<number>;
} {
  const client = getCentrifuge();
  const status = useSyncExternalStore(subscribeToStatus, getStatusSnapshot, getServerStatusSnapshot);

  const reconnect = useCallback(() => {
    if (!client) return;
    try {
      connectStartTime = performance.now();
      client.disconnect();
      client.connect();
      syncSnapshot();
    } catch (err) {
      console.warn("[Centrifuge] Reconnect error:", err);
    }
  }, [client]);

  const disconnect = useCallback(() => {
    if (!client) return;
    try {
      client.disconnect();
      syncSnapshot();
    } catch (err) {
      console.warn("[Centrifuge] Disconnect error:", err);
    }
  }, [client]);

  const measureRtt = useCallback(async (): Promise<number> => {
    const start = performance.now();
    try {
      const res = await fetch("/api/realtime/token", {
        method: "HEAD",
        cache: "no-store",
      });
      if (res.ok) {
        const val = Math.max(1, Math.round(performance.now() - start));
        lastMeasuredRtt = val;
        syncSnapshot(val);
        return val;
      }
    } catch {}
    return lastMeasuredRtt;
  }, []);

  return {
    ...status,
    centrifuge: client,
    reconnect,
    disconnect,
    measureRtt,
  };
}

export function useCentrifuge(): {
  centrifuge: Centrifuge | null;
  isConnected: boolean;
} {
  const client = getCentrifuge();
  // 遵循 rerender-derived-state 准则：仅订阅单一布尔状态，杜绝因 RTT 测速抖动引发全组件级重渲染
  const isConnected = useSyncExternalStore(
    subscribeToStatus,
    () => currentStatusSnapshot.isConnected,
    () => false,
  );
  return { centrifuge: client, isConnected };
}

export interface UseSubscriptionOptions<T = unknown> {
  onPublication?: (publication: { data: T; offset?: number }) => void;
  onJoin?: (ctx: JoinContext) => void;
  onLeave?: (ctx: LeaveContext) => void;
  onSubscribed?: () => void;
  onError?: (err: unknown) => void;
}

const channelSubscribersCount = new Map<string, number>();

export function useSubscription<T = unknown>(
  channel: string | undefined,
  onPublicationOrOptions?: ((publication: { data: T; offset?: number }) => void) | UseSubscriptionOptions<T>,
  options?: UseSubscriptionOptions<T>,
) {
  // Support both useSubscription(channel, onPublication) and useSubscription(channel, options)
  const resolvedOptions: UseSubscriptionOptions<T> =
    typeof onPublicationOrOptions === "function"
      ? { ...options, onPublication: onPublicationOrOptions }
      : onPublicationOrOptions || {};

  // 遵循 advanced-use-latest 准则：在渲染期同步捕获最新回调引用，规避微任务与异步到达竞态
  const optionsRef = useLatest(resolvedOptions);

  useEffect(() => {
    if (!channel || typeof window === "undefined") return;
    const client = getCentrifuge();
    if (!client) return;

    try {
      const sub = client.getSubscription(channel) ?? client.newSubscription(channel);
      channelSubscribersCount.set(channel, (channelSubscribersCount.get(channel) ?? 0) + 1);

      const pubHandler = (ctx: PublicationContext) => {
        optionsRef.current.onPublication?.({
          data: ctx.data as T,
          offset: ctx.offset,
        });
      };

      const joinHandler = (ctx: JoinContext) => {
        optionsRef.current.onJoin?.(ctx);
      };

      const leaveHandler = (ctx: LeaveContext) => {
        optionsRef.current.onLeave?.(ctx);
      };

      const subscribedHandler = () => {
        optionsRef.current.onSubscribed?.();
      };

      const errorHandler = (err: unknown) => {
        optionsRef.current.onError?.(err);
      };

      sub.on("publication", pubHandler);
      sub.on("join", joinHandler);
      sub.on("leave", leaveHandler);
      sub.on("subscribed", subscribedHandler);
      sub.on("error", errorHandler);

      if (sub.state === "unsubscribed") {
        sub.subscribe();
      }

      return () => {
        sub.removeListener("publication", pubHandler);
        sub.removeListener("join", joinHandler);
        sub.removeListener("leave", leaveHandler);
        sub.removeListener("subscribed", subscribedHandler);
        sub.removeListener("error", errorHandler);

        const remaining = (channelSubscribersCount.get(channel) ?? 1) - 1;
        if (remaining <= 0) {
          channelSubscribersCount.delete(channel);
          sub.unsubscribe();
          client.removeSubscription(sub);
        } else {
          channelSubscribersCount.set(channel, remaining);
        }
      };
    } catch (e) {
      console.warn(`[Centrifuge] Error subscribing to ${channel}:`, e);
    }
  }, [channel, optionsRef]);
}
