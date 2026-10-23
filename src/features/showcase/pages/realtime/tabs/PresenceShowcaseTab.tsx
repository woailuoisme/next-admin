"use client";

import { useCallback, useState } from "react";
import { Clock, DoorOpen, LogOut, Radio, Send, Shield, Trash2, UserCheck, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";
import { publishRealtime } from "../api";
import type { PresenceMember } from "../types";

interface PresenceEventLog {
  id: string;
  type: "join" | "leave" | "action";
  user: string;
  name: string;
  role: string;
  detail: string;
  timestamp: number;
}

const BASE_TIME = 1774000000000;

const INITIAL_MEMBERS: PresenceMember[] = [
  {
    client: "local-admin-client",
    user: "admin_operator",
    name: "系统超级管理员 (您)",
    role: "Admin",
    joinedAt: BASE_TIME - 3600000,
    lastAction: "正在查看实时席位监控大盘",
  },
  {
    client: "seat-2-devops",
    user: "devops_alex",
    name: "Alex (云原生运维)",
    role: "DevOps",
    joinedAt: BASE_TIME - 1800000,
    lastAction: "已同步 Centrifugo v6 容器集群配置",
  },
  {
    client: "seat-3-analyst",
    user: "analyst_emma",
    name: "Emma (风控审核专员)",
    role: "Analyst",
    joinedAt: BASE_TIME - 900000,
    lastAction: "正在审查大额出金订单 #ORD-8821",
  },
];

const INITIAL_EVENT_LOGS: PresenceEventLog[] = [
  {
    id: "log-1",
    type: "join",
    user: "devops_alex",
    name: "Alex (云原生运维)",
    role: "DevOps",
    detail: "加入 public:presence 空间",
    timestamp: BASE_TIME - 1800000,
  },
  {
    id: "log-2",
    type: "action",
    user: "analyst_emma",
    name: "Emma (风控审核专员)",
    role: "Analyst",
    detail: "正在审查大额出金订单 #ORD-8821",
    timestamp: BASE_TIME - 900000,
  },
];

export function PresenceShowcaseTab() {
  const { isConnected } = useCentrifuge();
  const [members, setMembers] = useState<PresenceMember[]>(INITIAL_MEMBERS);
  const [eventLogs, setEventLogs] = useState<PresenceEventLog[]>(INITIAL_EVENT_LOGS);
  const [myActionInput, setMyActionInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Subscribe to channel 'public:presence'
  const handlePresencePublication = useCallback((pub: { data: Record<string, unknown> }) => {
    const data = pub.data as {
      type?: "join" | "leave" | "action";
      user?: string;
      name?: string;
      role?: string;
      action?: string;
    };

    if (!data.user) return;

    const userName = data.name || data.user;
    const userRole = data.role || "Member";

    const pushLog = (type: PresenceEventLog["type"], detail: string) =>
      setEventLogs((prev) => [
        {
          id: `evt-${Date.now()}-${Math.random()}`,
          type,
          user: data.user as string,
          name: userName,
          role: userRole,
          detail,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 40),
      ]);

    if (data.type === "join") {
      setMembers((prev) => {
        if (prev.some((m) => m.user === data.user)) return prev;
        return [
          ...prev,
          {
            client: `client-${Date.now()}`,
            user: data.user as string,
            name: userName,
            role: userRole,
            joinedAt: Date.now(),
            lastAction: "刚接入协作空间",
          },
        ];
      });
      pushLog("join", "实时上线加入当前频道");
    } else if (data.type === "leave") {
      setMembers((prev) => prev.filter((m) => m.user !== data.user));
      pushLog("leave", "退出当前协同席位");
    } else if (data.type === "action") {
      const actionText = data.action || "更新了席位状态";
      setMembers((prev) => prev.map((m) => (m.user === data.user ? { ...m, lastAction: actionText } : m)));
      pushLog("action", actionText);
    }
  }, []);

  useSubscription("public:presence", handlePresencePublication);

  // Broadcast current user's action
  const handleBroadcastMyAction = async () => {
    if (!myActionInput.trim()) return;
    setIsPublishing(true);
    const text = myActionInput.trim();
    try {
      await publishRealtime("public:presence", {
        type: "action",
        user: "admin_operator",
        name: "系统超级管理员 (您)",
        role: "Admin",
        action: text,
      });
      setMyActionInput("");
    } catch (e) {
      console.warn("Failed to publish presence action:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  // Simulate coworker join
  const handleSimulateJoin = async () => {
    const roles = ["Auditor", "Engineer", "Designer", "Support", "Operator"];
    const names = ["Lucas", "Sarah", "David", "Chloe", "William", "Zoe"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomUser = `user_${randomName.toLowerCase()}_${Math.floor(Math.random() * 900 + 100)}`;

    try {
      await publishRealtime("public:presence", {
        type: "join",
        user: randomUser,
        name: `${randomName} (${randomRole})`,
        role: randomRole,
      });
    } catch (e) {
      console.warn("Simulate join error:", e);
    }
  };

  // Simulate coworker leave
  const handleSimulateLeave = async () => {
    // Pick a non-admin member
    const candidates = members.filter((m) => m.user !== "admin_operator");
    if (candidates.length === 0) return;
    const target = candidates[candidates.length - 1];

    try {
      await publishRealtime("public:presence", {
        type: "leave",
        user: target.user,
        name: target.name,
        role: target.role,
      });
    } catch (e) {
      console.warn("Simulate leave error:", e);
    }
  };

  return (
    <TabsContent value="presence" className="space-y-6">
      {/* Action / Control Header */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-semibold">多席位协同感知 · 当前在线 {members.length} 人</h3>
              <p className="text-muted-foreground text-xs">
                订阅频道 public:presence，支持多客户端席位实时感知与协作事件同步
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateJoin}
              disabled={!isConnected}
              className="h-8 gap-1.5 text-xs"
            >
              <UserPlus className="text-primary h-3.5 w-3.5" />
              模拟同伴接入
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateLeave}
              disabled={!isConnected || members.filter((m) => m.user !== "admin_operator").length === 0}
              className="text-muted-foreground h-8 gap-1.5 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              模拟同伴离线
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Left Seats Grid (2/3), Right Event Waterfall (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Online Seats List */}
        <div className="space-y-4 lg:col-span-2">
          {/* My Current Status Broadcast */}
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center justify-between text-sm font-semibold">
                <span>广播当前席位状态与动作</span>
                <Badge variant="outline" className="text-xs">
                  当前操作者
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                在当前空间实时共享您正在进行的操作（例如处理工单、审查流水等）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={myActionInput}
                  onChange={(e) => setMyActionInput(e.target.value)}
                  placeholder="输入您正在进行的操作... 例如：已核对 10 月末结算账单"
                  className="h-9 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBroadcastMyAction();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleBroadcastMyAction}
                  disabled={isPublishing || !myActionInput.trim() || !isConnected}
                  className="h-9 shrink-0 gap-1.5 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  广播
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {members.map((member) => {
              const isMe = member.user === "admin_operator";
              return (
                <Card
                  key={member.client + member.user}
                  className={`bg-card border-border hover:border-primary/40 p-4 shadow-xs transition-all ${
                    isMe ? "ring-primary/20 ring-1" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground text-sm font-medium">{member.name}</span>
                          {isMe && (
                            <Badge variant="default" className="h-4 px-1 text-[10px]">
                              YOU
                            </Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground font-mono text-xs">@{member.user}</span>
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-[10px]">
                      <Shield className="mr-1 h-3 w-3" />
                      {member.role}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 mt-3 rounded-md p-2.5">
                    <p className="text-foreground text-xs font-normal">{member.lastAction}</p>
                    <div className="text-muted-foreground mt-2 flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>接入时间: {new Date(member.joinedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Realtime Join / Leave / Action Event Feed */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-foreground text-sm font-semibold">席位动态事件瀑布</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">实时捕获加入、离线与动作发布</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEventLogs([])}
              className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[460px] px-4 pb-4">
              <div className="space-y-3">
                {eventLogs.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center text-xs">暂无动态事件</div>
                ) : (
                  eventLogs.map((evt) => (
                    <div
                      key={evt.id}
                      className="border-border bg-card/60 flex flex-col gap-1 rounded-md border p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {evt.type === "join" ? (
                            <Badge variant="default" className="h-4 px-1 text-[10px]">
                              <UserCheck className="mr-0.5 h-2.5 w-2.5" />
                              上线
                            </Badge>
                          ) : evt.type === "leave" ? (
                            <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                              <DoorOpen className="mr-0.5 h-2.5 w-2.5" />
                              离线
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="h-4 px-1 text-[10px]">
                              <Radio className="text-primary mr-0.5 h-2.5 w-2.5" />
                              动作
                            </Badge>
                          )}
                          <span className="text-foreground font-medium">{evt.name}</span>
                        </div>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">{evt.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
