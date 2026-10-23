"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Cpu, HardDrive, type LucideIcon, Radio, Send, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { AreaTrendChart } from "@/components/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";
import { publishRealtime } from "../api";
import type { TelemetryMetricPoint } from "../types";

const INITIAL_POINTS: TelemetryMetricPoint[] = [
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

/** 遥测指标卡：标题 + 右上角图标，数值 + 自定义脚注 */
function KpiCard({
  title,
  icon: Icon,
  value,
  children,
}: {
  title: string;
  icon: LucideIcon;
  value: string | number;
  children: ReactNode;
}) {
  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-xs font-medium">{title}</CardTitle>
        <Icon className="text-primary h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-foreground font-mono text-2xl font-bold">{value}</div>
        {children}
      </CardContent>
    </Card>
  );
}

export function TelemetryShowcaseTab() {
  const { isConnected } = useCentrifuge();
  const [metrics, setMetrics] = useState<TelemetryMetricPoint[]>(INITIAL_POINTS);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [streamInterval, setStreamInterval] = useState("2000");
  const [isSendingPulse, setIsSendingPulse] = useState(false);
  const [lastMessageOffset, setLastMessageOffset] = useState<number | null>(null);

  const currentPoint = metrics[metrics.length - 1] ?? INITIAL_POINTS[0];

  // Handle incoming publication from Centrifugo channel 'public:telemetry'
  const handleTelemetryPublication = useCallback((pub: { data: Partial<TelemetryMetricPoint>; offset?: number }) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const incoming = pub.data;

    if (pub.offset !== undefined) {
      setLastMessageOffset(pub.offset);
    }

    setMetrics((prev) => {
      const newPoint: TelemetryMetricPoint = {
        time: timeStr,
        timestamp: now.getTime(),
        qps: incoming.qps ?? Math.floor(1900 + Math.random() * 700),
        tps: incoming.tps ?? Math.floor(480 + Math.random() * 200),
        cpu: incoming.cpu ?? Math.floor(35 + Math.random() * 20),
        memory: incoming.memory ?? Math.floor(48 + Math.random() * 8),
        activeSockets: incoming.activeSockets ?? 1080 + Math.floor(Math.random() * 40),
      };
      const next = [...prev.slice(-24), newPoint];
      return next;
    });
  }, []);

  useSubscription<Partial<TelemetryMetricPoint>>("public:telemetry", handleTelemetryPublication);

  // Manual pulse publish
  const sendTelemetryPulse = useCallback(async () => {
    setIsSendingPulse(true);
    const now = new Date();
    const payload: Partial<TelemetryMetricPoint> = {
      qps: Math.floor(2800 + Math.random() * 800),
      tps: Math.floor(750 + Math.random() * 300),
      cpu: Math.floor(55 + Math.random() * 25),
      memory: Math.floor(52 + Math.random() * 10),
      activeSockets: 1150 + Math.floor(Math.random() * 80),
      time: now.toTimeString().slice(0, 8),
      timestamp: now.getTime(),
    };

    try {
      const res = await publishRealtime("public:telemetry", payload);
      if (res.ok) {
        const json = await res.json();
        if (json.result?.offset) {
          setLastMessageOffset(json.result.offset);
        }
      }
    } catch (e) {
      console.warn("Failed to publish telemetry pulse:", e);
    } finally {
      setIsSendingPulse(false);
    }
  }, []);

  // Auto-stream interval generator
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoStreaming && isConnected) {
      const intervalMs = Number.parseInt(streamInterval, 10) || 2000;
      intervalRef.current = setInterval(() => {
        sendTelemetryPulse();
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoStreaming, streamInterval, isConnected, sendTelemetryPulse]);

  // Format chart data
  const chartData = metrics.map((m) => ({
    label: m.time,
    value: m.qps,
    secondaryValue: m.tps,
  }));

  return (
    <TabsContent value="telemetry" className="space-y-6">
      {/* Top Controller Bar */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-semibold">频道: public:telemetry</h3>
              <p className="text-muted-foreground text-xs">
                实时接收高频 QPS/TPS 指标脉冲流
                {lastMessageOffset !== null && ` · 当前 Offset: #${lastMessageOffset}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-stream"
                checked={isAutoStreaming}
                onCheckedChange={setIsAutoStreaming}
                disabled={!isConnected}
              />
              <label htmlFor="auto-stream" className="text-foreground cursor-pointer text-xs font-medium">
                自动推送数据流
              </label>
            </div>

            <Select value={streamInterval} onValueChange={setStreamInterval} disabled={!isAutoStreaming}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue placeholder="频率" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1 秒/次</SelectItem>
                <SelectItem value="2000">2 秒/次</SelectItem>
                <SelectItem value="5000">5 秒/次</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={sendTelemetryPulse}
              disabled={isSendingPulse || !isConnected}
              className="h-8 gap-1.5 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              单次脉冲
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="实时请求吞吐 (QPS)" icon={Activity} value={currentPoint.qps.toLocaleString()}>
          <p className="text-muted-foreground mt-1 text-[11px]">峰值: {(currentPoint.qps * 1.25).toFixed(0)} req/s</p>
        </KpiCard>

        <KpiCard title="事务提交速率 (TPS)" icon={Zap} value={currentPoint.tps.toLocaleString()}>
          <p className="text-muted-foreground mt-1 text-[11px]">成功率: 99.98%</p>
        </KpiCard>

        <KpiCard title="CPU 核心负载" icon={Cpu} value={`${currentPoint.cpu}%`}>
          <Progress value={currentPoint.cpu} className="mt-2 h-1.5" />
        </KpiCard>

        <KpiCard title="内存占用 / Sockets" icon={HardDrive} value={`${currentPoint.memory}%`}>
          <p className="text-muted-foreground mt-1 text-[11px]">{currentPoint.activeSockets} 活跃长连接</p>
        </KpiCard>
      </div>

      {/* Main Realtime Waveform Chart */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="flex flex-col pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-foreground text-base">高频实时数据流波形 (QPS 主线 vs TPS 副线)</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              基于 WebSocket Push 动态更新的滚动时间序列波形，保持最近 25 个采样点
            </CardDescription>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <Badge variant="outline" className="text-xs">
              <span className="bg-primary mr-1.5 inline-block h-2 w-2 rounded-full" />
              QPS 吞吐
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="bg-secondary mr-1.5 inline-block h-2 w-2 rounded-full" />
              TPS 事务
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <AreaTrendChart
            data={chartData}
            dataKey="value"
            secondaryDataKey="secondaryValue"
            xAxisKey="label"
            height={320}
            showGrid
            showTooltip
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
