export interface TelemetryMetricPoint {
  time: string;
  timestamp: number;
  qps: number;
  tps: number;
  cpu: number;
  memory: number;
  activeSockets: number;
}

export interface PresenceMember {
  client: string;
  user: string;
  name: string;
  role: string;
  avatar?: string;
  joinedAt: number;
  lastAction: string;
}

export interface StreamMessageItem {
  id: string;
  channel: string;
  topic: "telemetry" | "presence" | "notification" | "custom";
  level: "info" | "warning" | "error" | "success";
  title: string;
  content: string;
  sender: string;
  timestamp: number;
  offset?: number;
  rawPayload?: Record<string, unknown>;
}
