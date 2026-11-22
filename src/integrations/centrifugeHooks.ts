"use client";

import { useLatest } from "ahooks";
import type { Centrifuge, JoinContext, LeaveContext, PublicationContext } from "centrifuge";
import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  getCentrifuge,
  getCentrifugeServerSnapshot,
  getCentrifugeStatusSnapshot,
  markConnectStart,
  measureCentrifugeRtt,
  type RealtimeStatusState,
  subscribeToCentrifugeStatus,
  syncCentrifugeSnapshot,
} from "./centrifugeClient";

export function useCentrifugeStatus(): RealtimeStatusState & {
  centrifuge: Centrifuge | null;
  reconnect: () => void;
  disconnect: () => void;
  measureRtt: () => Promise<number>;
} {
  const client = getCentrifuge();
  const status = useSyncExternalStore(
    subscribeToCentrifugeStatus,
    getCentrifugeStatusSnapshot,
    getCentrifugeServerSnapshot,
  );

  const reconnect = useCallback(() => {
    if (!client) return;
    try {
      markConnectStart();
      client.disconnect();
      client.connect();
      syncCentrifugeSnapshot();
    } catch (err) {
      console.warn("[Centrifuge] Reconnect error:", err);
    }
  }, [client]);

  const disconnect = useCallback(() => {
    if (!client) return;
    try {
      client.disconnect();
      syncCentrifugeSnapshot();
    } catch (err) {
      console.warn("[Centrifuge] Disconnect error:", err);
    }
  }, [client]);

  return { ...status, centrifuge: client, reconnect, disconnect, measureRtt: measureCentrifugeRtt };
}

export function useCentrifuge(): { centrifuge: Centrifuge | null; isConnected: boolean } {
  const client = getCentrifuge();
  const isConnected = useSyncExternalStore(
    subscribeToCentrifugeStatus,
    () => getCentrifugeStatusSnapshot().isConnected,
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
  const resolvedOptions: UseSubscriptionOptions<T> =
    typeof onPublicationOrOptions === "function"
      ? { ...options, onPublication: onPublicationOrOptions }
      : onPublicationOrOptions || {};

  const optionsRef = useLatest(resolvedOptions);

  useEffect(() => {
    if (!channel || typeof window === "undefined") return;
    const client = getCentrifuge();
    if (!client) return;

    try {
      const sub = client.getSubscription(channel) ?? client.newSubscription(channel);
      channelSubscribersCount.set(channel, (channelSubscribersCount.get(channel) ?? 0) + 1);

      const pubHandler = (ctx: PublicationContext) => {
        optionsRef.current.onPublication?.({ data: ctx.data as T, offset: ctx.offset });
      };
      const joinHandler = (ctx: JoinContext) => optionsRef.current.onJoin?.(ctx);
      const leaveHandler = (ctx: LeaveContext) => optionsRef.current.onLeave?.(ctx);
      const subscribedHandler = () => optionsRef.current.onSubscribed?.();
      const errorHandler = (err: unknown) => optionsRef.current.onError?.(err);

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
