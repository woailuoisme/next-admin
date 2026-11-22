import type { PresenceMember, StreamMessageItem, TelemetryMetricPoint } from "./types";

const BASE_TIMESTAMP = 1774000000000;

export const INITIAL_BROADCAST_MESSAGES: StreamMessageItem[] = [
  {
    id: "msg-101",
    channel: "public:demo",
    topic: "custom",
    level: "info",
    title: "Centrifugo v6 引擎启动完成",
    content: "本地 WebSocket 节点已就绪，已挂载 Redis/Valkey 引擎驱动",
    sender: "system_kernel",
    timestamp: BASE_TIMESTAMP - 120000,
    offset: 1,
    rawPayload: { engine: "redis", port: 48000, version: "v6.10" },
  },
  {
    id: "msg-102",
    channel: "notification",
    topic: "notification",
    level: "success",
    title: "全局安全策略验证通过",
    content: "HMAC-SHA256 Token 鉴权与 HTTP API 密钥隔离机制生效中",
    sender: "security_guard",
    timestamp: BASE_TIMESTAMP - 60000,
    offset: 2,
    rawPayload: { status: "secure", hmac: "HS256" },
  },
];

/** 一键套用的广播预设模板 */
export const BROADCASTER_TEMPLATES = [
  {
    label: "发布就绪",
    title: "🚀 生产发布就绪 (v2.4.0)",
    content: "核心支付网关与结算服务已完成灰度切换，流量分配 100%",
    level: "success",
    channel: "notification",
  },
  {
    label: "副本预警",
    title: "⚠️ 数据库读写副本延迟预警",
    content: "Valkey / Redis 从节点同步延迟超过 500ms，请及时关注",
    level: "warning",
    channel: "public:demo",
  },
  {
    label: "全局通知",
    title: "🔔 全局安全合规巡检通知",
    content: "请各席位管理员于 18:00 前完成权限核验并签署交接日志",
    level: "info",
    channel: "notification",
  },
] as const;

export interface PresenceEventLog {
  id: string;
  type: "join" | "leave" | "action";
  user: string;
  name: string;
  role: string;
  detail: string;
  timestamp: number;
}

export const INITIAL_PRESENCE_MEMBERS: PresenceMember[] = [
  {
    client: "local-admin-client",
    user: "admin_operator",
    name: "系统超级管理员 (您)",
    role: "Admin",
    joinedAt: BASE_TIMESTAMP - 3600000,
    lastAction: "正在查看实时席位监控大盘",
  },
  {
    client: "seat-2-devops",
    user: "devops_alex",
    name: "Alex (云原生运维)",
    role: "DevOps",
    joinedAt: BASE_TIMESTAMP - 1800000,
    lastAction: "已同步 Centrifugo v6 容器集群配置",
  },
  {
    client: "seat-3-analyst",
    user: "analyst_emma",
    name: "Emma (风控审核专员)",
    role: "Analyst",
    joinedAt: BASE_TIMESTAMP - 900000,
    lastAction: "正在审查大额出金订单 #ORD-8821",
  },
];

export const INITIAL_PRESENCE_EVENT_LOGS: PresenceEventLog[] = [
  {
    id: "log-1",
    type: "join",
    user: "devops_alex",
    name: "Alex (云原生运维)",
    role: "DevOps",
    detail: "加入 public:presence 空间",
    timestamp: BASE_TIMESTAMP - 1800000,
  },
  {
    id: "log-2",
    type: "action",
    user: "analyst_emma",
    name: "Emma (风控审核专员)",
    role: "Analyst",
    detail: "正在审查大额出金订单 #ORD-8821",
    timestamp: BASE_TIMESTAMP - 900000,
  },
];

export const INITIAL_TELEMETRY_POINTS: TelemetryMetricPoint[] = [
  { time: "12:00:00", timestamp: 1774000000000, qps: 1850, tps: 460, cpu: 32, memory: 46, activeSockets: 1040 },
  { time: "12:00:02", timestamp: 1774000002000, qps: 1920, tps: 480, cpu: 35, memory: 47, activeSockets: 1045 },
  { time: "12:00:04", timestamp: 1774000004000, qps: 2100, tps: 510, cpu: 38, memory: 48, activeSockets: 1050 },
  { time: "12:00:06", timestamp: 1774000006000, qps: 1980, tps: 495, cpu: 36, memory: 48, activeSockets: 1052 },
  { time: "12:00:08", timestamp: 1774000008000, qps: 2050, tps: 520, cpu: 40, memory: 49, activeSockets: 1055 },
  { time: "12:00:10", timestamp: 1774000010000, qps: 2200, tps: 540, cpu: 42, memory: 50, activeSockets: 1060 },
  { time: "12:00:12", timestamp: 1774000012000, qps: 2150, tps: 530, cpu: 41, memory: 49, activeSockets: 1058 },
  { time: "12:00:14", timestamp: 1774000014000, qps: 2280, tps: 560, cpu: 44, memory: 51, activeSockets: 1065 },
  { time: "12:00:16", timestamp: 1774000016000, qps: 2310, tps: 575, cpu: 45, memory: 52, activeSockets: 1070 },
  { time: "12:00:18", timestamp: 1774000018000, qps: 2240, tps: 550, cpu: 43, memory: 51, activeSockets: 1068 },
  { time: "12:00:20", timestamp: 1774000020000, qps: 2390, tps: 590, cpu: 46, memory: 52, activeSockets: 1075 },
  { time: "12:00:22", timestamp: 1774000022000, qps: 2420, tps: 600, cpu: 47, memory: 53, activeSockets: 1080 },
  { time: "12:00:24", timestamp: 1774000024000, qps: 2350, tps: 580, cpu: 45, memory: 52, activeSockets: 1078 },
  { time: "12:00:26", timestamp: 1774000026000, qps: 2480, tps: 620, cpu: 48, memory: 54, activeSockets: 1085 },
  { time: "12:00:28", timestamp: 1774000028000, qps: 2520, tps: 630, cpu: 49, memory: 54, activeSockets: 1090 },
];
