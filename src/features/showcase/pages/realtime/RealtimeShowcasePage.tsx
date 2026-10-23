"use client";

import { useState } from "react";
import { Activity, RefreshCw, Server, Users, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCentrifugeStatus } from "@/integrations/centrifuge";
import { RealtimeHealthBar } from "./components/RealtimeHealthBar";
import { BroadcasterShowcaseTab } from "./tabs/BroadcasterShowcaseTab";
import { PresenceShowcaseTab } from "./tabs/PresenceShowcaseTab";
import { TelemetryShowcaseTab } from "./tabs/TelemetryShowcaseTab";

export function RealtimeShowcasePage() {
  const { reconnect } = useCentrifugeStatus();
  const [activeTab, setActiveTab] = useState("telemetry");

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              实时通信引擎 (Centrifugo / Centrifuge)
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary gap-1">
              <Server className="h-3 w-3" />
              v6.10 (Redis Engine)
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            生产级 WebSocket 双向长连接、高频遥测波形、多席位协同感知与广播事件流瀑布
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reconnect} className="h-8 gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            重置长连接
          </Button>
        </div>
      </div>

      {/* Global Health Diagnostic Bar */}
      <RealtimeHealthBar activeChannels={["public:telemetry", "public:presence", "public:demo", "notification"]} />

      {/* Main Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/70 grid h-auto! w-full grid-cols-1 gap-1 border p-1 sm:grid-cols-3">
          <TabsTrigger value="telemetry" className="gap-2 px-3 py-2 text-center text-xs font-medium">
            <Activity className="text-primary h-4 w-4" />
            <span>高频遥测监控流 (Telemetry)</span>
          </TabsTrigger>

          <TabsTrigger value="presence" className="gap-2 px-3 py-2 text-center text-xs font-medium">
            <Users className="text-primary h-4 w-4" />
            <span>多席位协同感知 (Presence)</span>
          </TabsTrigger>

          <TabsTrigger value="broadcaster" className="gap-2 px-3 py-2 text-center text-xs font-medium">
            <Volume2 className="text-primary h-4 w-4" />
            <span>广播控制台与日志 (Broadcaster)</span>
          </TabsTrigger>
        </TabsList>

        <TelemetryShowcaseTab />
        <PresenceShowcaseTab />
        <BroadcasterShowcaseTab />
      </Tabs>
    </div>
  );
}

export default RealtimeShowcasePage;
