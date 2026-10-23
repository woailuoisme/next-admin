/** 通过服务端代理向 Centrifugo 频道推送一条消息 */
export function publishRealtime(channel: string, data: unknown) {
  return fetch("/api/realtime/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, data }),
  });
}
