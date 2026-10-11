"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { Centrifuge, type PublicationContext } from "centrifuge";

let centrifugeInstance: Centrifuge | null = null;

export function getCentrifuge(): Centrifuge | null {
  if (typeof window === "undefined") return null;
  if (!centrifugeInstance) {
    const wsUrl = process.env.NEXT_PUBLIC_CENTRIFUGE_WS_URL ?? "ws://localhost:8000/connection/websocket";
    try {
      centrifugeInstance = new Centrifuge(wsUrl);
    } catch (e) {
      console.warn("[Centrifuge] Failed to init centrifuge:", e);
    }
  }
  return centrifugeInstance;
}

const getServerSnapshot = () => false;

export function useCentrifuge() {
  const client = getCentrifuge();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!client) return () => {};
      client.on("connected", onStoreChange);
      client.on("disconnected", onStoreChange);
      return () => {
        client.removeListener("connected", onStoreChange);
        client.removeListener("disconnected", onStoreChange);
      };
    },
    [client],
  );

  const getSnapshot = useCallback(() => client?.state === "connected", [client]);

  const isConnected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { centrifuge: client, isConnected };
}

export function useSubscription<T = unknown>(
  channel: string | undefined,
  onPublication: (publication: { data: T }) => void,
) {
  const onPublicationRef = useRef(onPublication);
  useEffect(() => {
    onPublicationRef.current = onPublication;
  });

  useEffect(() => {
    if (!channel || typeof window === "undefined") return;
    const client = getCentrifuge();
    if (!client) return;

    try {
      const sub = client.getSubscription(channel) ?? client.newSubscription(channel);
      const handler = (ctx: PublicationContext) => {
        onPublicationRef.current({ data: ctx.data as T });
      };

      sub.on("publication", handler);

      if (sub.state === "unsubscribed") {
        sub.subscribe();
      }

      return () => {
        sub.removeListener("publication", handler);
        if (sub.listeners("publication").length === 0) {
          sub.unsubscribe();
          client.removeSubscription(sub);
        }
      };
    } catch (e) {
      console.warn(`[Centrifuge] Error subscribing to ${channel}:`, e);
    }
  }, [channel]);
}
