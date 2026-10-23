"use client";

import { useCallback, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Info,
  Pause,
  Play,
  Radio,
  Send,
  Trash2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";
import { publishRealtime } from "../api";
import type { StreamMessageItem } from "../types";

const BASE_TIMESTAMP = 1774000000000;

const INITIAL_MESSAGES: StreamMessageItem[] = [
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
const MESSAGE_TEMPLATES = [
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

export function BroadcasterShowcaseTab() {
  const { isConnected } = useCentrifuge();
  const [messages, setMessages] = useState<StreamMessageItem[]>(INITIAL_MESSAGES);
  const [isPaused, setIsPaused] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");

  // Form states
  const [targetChannel, setTargetChannel] = useState("public:demo");
  const [messageLevel, setMessageLevel] = useState<"info" | "success" | "warning" | "error">("info");
  const [title, setTitle] = useState("新订单已支付成功");
  const [content, setContent] = useState("订单号 #ORD-2026-9921，金额 ¥3,480.00，已通过实时通道下发履约通知");
  const [isPublishing, setIsPublishing] = useState(false);
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});

  // Incoming publication handler for 'public:demo'
  const handlePublicDemoPub = useCallback(
    (pub: { data: Record<string, unknown>; offset?: number }) => {
      if (isPaused) return;
      const data = pub.data;
      const newItem: StreamMessageItem = {
        id: (data.id as string) || `msg-${Date.now()}-${Math.random()}`,
        channel: "public:demo",
        topic: (data.topic as StreamMessageItem["topic"]) || "custom",
        level: (data.level as StreamMessageItem["level"]) || "info",
        title: (data.title as string) || "实时广播事件",
        content: (data.content as string) || JSON.stringify(data),
        sender: (data.sender as string) || "anonymous_operator",
        timestamp: (data.timestamp as number) || Date.now(),
        offset: pub.offset,
        rawPayload: data,
      };

      setMessages((prev) => [newItem, ...prev.slice(0, 100)]);
    },
    [isPaused],
  );

  // Incoming publication handler for 'notification'
  const handleNotificationPub = useCallback(
    (pub: { data: Record<string, unknown>; offset?: number }) => {
      if (isPaused) return;
      const data = pub.data;
      const level = (data.level as StreamMessageItem["level"]) || "info";
      const itemTitle = (data.title as string) || "系统广播通知";
      const itemContent = (data.content as string) || "";

      // Trigger user-facing Sonner toast notification
      if (level === "error") {
        toast.error(itemTitle, { description: itemContent });
      } else if (level === "warning") {
        toast.warning(itemTitle, { description: itemContent });
      } else if (level === "success") {
        toast.success(itemTitle, { description: itemContent });
      } else {
        toast.info(itemTitle, { description: itemContent });
      }

      const newItem: StreamMessageItem = {
        id: (data.id as string) || `notif-${Date.now()}-${Math.random()}`,
        channel: "notification",
        topic: "notification",
        level,
        title: itemTitle,
        content: itemContent,
        sender: (data.sender as string) || "notification_broker",
        timestamp: (data.timestamp as number) || Date.now(),
        offset: pub.offset,
        rawPayload: data,
      };

      setMessages((prev) => [newItem, ...prev.slice(0, 100)]);
    },
    [isPaused],
  );

  useSubscription("public:demo", handlePublicDemoPub);
  useSubscription("notification", handleNotificationPub);

  // Send broadcast
  const handleSendBroadcast = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsPublishing(true);

    const payload = {
      id: `msg-${Date.now()}`,
      topic: targetChannel === "notification" ? "notification" : "custom",
      level: messageLevel,
      title: title.trim(),
      content: content.trim(),
      sender: "admin_console",
      timestamp: Date.now(),
      clientInfo: {
        agent: "Admin Panel Showcase",
        locale: "zh-CN",
      },
    };

    try {
      const res = await publishRealtime(targetChannel, payload);

      if (res.ok) {
        toast.success("广播消息已投递至 Centrifugo", {
          description: `目标频道: ${targetChannel}`,
        });
      } else {
        toast.error("广播发送失败，请检查容器状态");
      }
    } catch (e) {
      console.warn("Failed to publish broadcast:", e);
      toast.error("网络异常，无法投递消息");
    } finally {
      setIsPublishing(false);
    }
  };

  // Preset templates
  const applyTemplate = (
    tmplTitle: string,
    tmplContent: string,
    tmplLevel: "info" | "success" | "warning" | "error",
    tmplChannel: string,
  ) => {
    setTitle(tmplTitle);
    setContent(tmplContent);
    setMessageLevel(tmplLevel);
    setTargetChannel(tmplChannel);
  };

  const toggleExpand = (id: string) => {
    setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (filterLevel !== "all" && m.level !== filterLevel) return false;
    if (filterChannel !== "all" && m.channel !== filterChannel) return false;
    return true;
  });

  return (
    <TabsContent value="broadcaster" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left Column: Broadcast Composer (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Radio className="text-primary h-4 w-4" />
                消息与广播发送控制台
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                通过服务端代理以 APIKey 身份安全推送消息到 Centrifugo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium">快速套用预设模板:</span>
                <div className="flex flex-wrap gap-1.5">
                  {MESSAGE_TEMPLATES.map((tpl) => (
                    <Button
                      key={tpl.label}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => applyTemplate(tpl.title, tpl.content, tpl.level, tpl.channel)}
                    >
                      {tpl.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Target Channel */}
              <div className="space-y-1.5">
                <span className="text-foreground text-xs font-medium">目标发布频道</span>
                <Select value={targetChannel} onValueChange={setTargetChannel}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="选择频道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public:demo">public:demo (公共演示广播流)</SelectItem>
                    <SelectItem value="notification">notification (系统级轻提示 Toast)</SelectItem>
                    <SelectItem value="public:telemetry">public:telemetry (遥测指标流)</SelectItem>
                    <SelectItem value="public:presence">public:presence (席位协同流)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Level */}
              <div className="space-y-1.5">
                <span className="text-foreground text-xs font-medium">通知级别 (Level)</span>
                <Select
                  value={messageLevel}
                  onValueChange={(v) => setMessageLevel(v as "info" | "success" | "warning" | "error")}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="选择级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info · 普通信息</SelectItem>
                    <SelectItem value="success">Success · 操作成功</SelectItem>
                    <SelectItem value="warning">Warning · 潜在警告</SelectItem>
                    <SelectItem value="error">Error · 故障告警</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <span className="text-foreground text-xs font-medium">消息标题</span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入通知标题..."
                  className="h-9 text-xs"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <span className="text-foreground text-xs font-medium">消息正文详情</span>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入详细消息内容..."
                  rows={3}
                  className="resize-none text-xs"
                />
              </div>

              {/* Submit */}
              <Button
                variant="default"
                onClick={handleSendBroadcast}
                disabled={isPublishing || !isConnected || !title.trim() || !content.trim()}
                className="w-full gap-2 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
                {isPublishing ? "正在广播下发..." : "立刻广播下发"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Message Feed Waterfall (3 cols) */}
        <div className="space-y-4 lg:col-span-3">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="flex flex-col pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <Volume2 className="text-primary h-4 w-4" />
                  实时消息接收瀑布流 · 共 {messages.length} 条
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  通过 WebSocket 实时监听多频道 Publication 事件
                </CardDescription>
              </div>

              {/* Feed Controls */}
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-7 gap-1 text-xs"
                >
                  {isPaused ? (
                    <>
                      <Play className="text-primary h-3 w-3" />
                      恢复接收
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3" />
                      暂停滚动
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([])}
                  className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  清空
                </Button>
              </div>
            </CardHeader>

            {/* Filter toolbar */}
            <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-y px-4 py-2">
              <div className="flex items-center gap-2">
                <Filter className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-muted-foreground text-xs">过滤:</span>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue placeholder="级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有级别</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterChannel} onValueChange={setFilterChannel}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue placeholder="频道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有频道</SelectItem>
                    <SelectItem value="public:demo">public:demo</SelectItem>
                    <SelectItem value="notification">notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isPaused && (
                <Badge variant="outline" className="text-[10px] text-amber-500">
                  已暂停滚动更新
                </Badge>
              )}
            </div>

            <CardContent className="p-0">
              <ScrollArea className="h-[460px] p-4">
                <div className="space-y-3">
                  {filteredMessages.length === 0 ? (
                    <div className="text-muted-foreground py-16 text-center text-xs">
                      暂无广播消息，请在左侧发送一条测试消息
                    </div>
                  ) : (
                    filteredMessages.map((msg) => {
                      const isExpanded = !!expandedPayloads[msg.id];
                      return (
                        <div
                          key={msg.id}
                          className="border-border bg-card hover:bg-muted/30 flex flex-col gap-2 rounded-lg border p-3 text-xs shadow-xs transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {msg.level === "success" ? (
                                <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  SUCCESS
                                </Badge>
                              ) : msg.level === "warning" ? (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-amber-500/30 px-1.5 text-[10px] text-amber-500"
                                >
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  WARNING
                                </Badge>
                              ) : msg.level === "error" ? (
                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  ERROR
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                  <Info className="mr-1 h-3 w-3" />
                                  INFO
                                </Badge>
                              )}

                              <Badge variant="outline" className="font-mono text-[10px]">
                                {msg.channel}
                              </Badge>

                              {msg.offset !== undefined && (
                                <span className="text-muted-foreground font-mono text-[10px]">#{msg.offset}</span>
                              )}
                            </div>

                            <span className="text-muted-foreground font-mono text-[10px]">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-foreground text-xs font-semibold">{msg.title}</h4>
                            <p className="text-muted-foreground mt-0.5 text-xs">{msg.content}</p>
                          </div>

                          {msg.rawPayload && (
                            <div className="mt-1">
                              <button
                                type="button"
                                onClick={() => toggleExpand(msg.id)}
                                className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono text-[10px]"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                <span>原始 JSON Payload</span>
                              </button>
                              {isExpanded && (
                                <pre className="bg-muted text-muted-foreground mt-1.5 max-h-40 overflow-auto rounded-md p-2 font-mono text-[10px]">
                                  {JSON.stringify(msg.rawPayload, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}
