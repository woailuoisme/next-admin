"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Globe, RefreshCw, Unplug, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCentrifugeStatus } from "@/integrations/centrifuge";
import { cn } from "cn";

interface RealtimeHealthBarProps {
  activeChannels?: string[];
}

export function RealtimeHealthBar({
  activeChannels = ["public:telemetry", "public:presence", "public:demo"],
}: RealtimeHealthBarProps) {
  const { state, isConnected, rtt, wsUrl, reconnect, disconnect, measureRtt } = useCentrifugeStatus();
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = async () => {
    setIsPinging(true);
    await measureRtt();
    setIsPinging(false);
  };

  return (
    <Card className="bg-card border-border p-4 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Status indicator & WS info */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <>
                  <span className="bg-primary/75 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-primary relative inline-flex h-3 w-3 rounded-full" />
                </>
              ) : (
                <span className="bg-destructive relative inline-flex h-3 w-3 rounded-full" />
              )}
            </span>
            <span className="text-foreground text-sm font-semibold tracking-tight">Centrifugo v6 引擎状态</span>
          </div>

          <Badge
            variant={isConnected ? "default" : state === "connecting" ? "secondary" : "destructive"}
            className="capitalize"
          >
            {isConnected ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <WifiOff className="mr-1 h-3.5 w-3.5" />}
            {state}
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs">
                <Globe className="h-3.5 w-3.5" />
                <span className="max-w-[240px] truncate sm:max-w-xs">{wsUrl}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Centrifugo WebSocket 宿主机长连接终端</p>
            </TooltipContent>
          </Tooltip>

          <div className="bg-muted/70 text-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs">
            <Activity className="text-primary h-3.5 w-3.5" />
            <span>RTT 延迟:</span>
            <span className={cn("font-mono font-medium", rtt > 100 ? "text-destructive" : "text-foreground")}>
              {rtt > 0 ? `${rtt} ms` : "—"}
            </span>
          </div>
        </div>

        {/* Channels & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <span className="text-muted-foreground text-xs">活跃频道:</span>
            {activeChannels.map((ch) => (
              <Badge key={ch} variant="outline" className="text-muted-foreground font-mono text-[10px]">
                {ch}
              </Badge>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePing}
                disabled={isPinging || !isConnected}
                className="h-8 gap-1 text-xs"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isPinging && "animate-spin")} />
                探测延迟
              </Button>
            </TooltipTrigger>
            <TooltipContent>向服务端健康探针发送测速请求并更新 RTT</TooltipContent>
          </Tooltip>

          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="text-destructive hover:bg-destructive/10 h-8 gap-1 text-xs"
            >
              <Unplug className="h-3.5 w-3.5" />
              断开连接
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={reconnect} className="h-8 gap-1 text-xs">
              <Wifi className="h-3.5 w-3.5" />
              重新连接
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
