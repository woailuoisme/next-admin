import { RefreshCw } from "lucide-react";

import type { useLiveTicker } from "@/components/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { DEMO_STATES } from "../constants";
import type { DemoState } from "../types";

export interface StatsHeaderBarProps {
  demoState: DemoState;
  onDemoStateChange: (st: DemoState) => void;
  liveTicker: ReturnType<typeof useLiveTicker>;
}

export function StatsHeaderBar({ demoState, onDemoStateChange, liveTicker }: StatsHeaderBarProps) {
  return (
    <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Enterprise Stats & Visualizations
          </h1>
          <Badge variant="secondary" className="font-mono text-xs">
            v2.0 Toolkit
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          High-performance, composable statistics cards, real-time gauges, and Recharts widgets.
        </p>
      </div>

      {/* Global Demo Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
          {DEMO_STATES.map((st) => (
            <Button
              key={st}
              size="sm"
              variant={demoState === st ? "secondary" : "ghost"}
              className="h-7 text-xs capitalize"
              onClick={() => onDemoStateChange(st)}
            >
              {st}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={liveTicker.tick}>
          <RefreshCw className="h-3.5 w-3.5" />
          Pulse Step
        </Button>
        <Button
          variant={liveTicker.isRunning ? "secondary" : "default"}
          size="sm"
          className="h-8 font-mono text-xs"
          onClick={liveTicker.toggle}
        >
          {liveTicker.isRunning ? "Pause Stream" : "Resume Stream"}
        </Button>
      </div>
    </div>
  );
}
