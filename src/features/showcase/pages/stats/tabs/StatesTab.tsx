import { LiveStatCard, MultiMetricStatCard, ProgressStatCard, StatCard, type useLiveTicker } from "@/components/stats";
import { Button } from "@/components/ui/button";

import { DEMO_STATES } from "../constants";
import type { DemoState } from "../types";

export interface StatesTabProps {
  demoState: DemoState;
  onDemoStateChange: (st: DemoState) => void;
  isLoading: boolean;
  isError: boolean;
  liveTicker: ReturnType<typeof useLiveTicker>;
}

export function StatesTab({ demoState, onDemoStateChange, isLoading, isError, liveTicker }: StatesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">State Simulation & Resilience Testing</h2>
        <p className="text-muted-foreground text-xs">
          Verify how stats components behave across various network and lifecycle conditions.
        </p>
      </div>

      <div className="bg-muted/20 flex items-center gap-2 rounded-lg border p-3">
        <span className="text-foreground mr-2 text-xs font-semibold">Trigger Current State:</span>
        {DEMO_STATES.map((st) => (
          <Button
            key={st}
            size="sm"
            variant={demoState === st ? "default" : "outline"}
            className="h-7 text-xs capitalize"
            onClick={() => onDemoStateChange(st)}
          >
            {st}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Loading Skeleton State"
          value={32800}
          prefix="$"
          isLoading={isLoading}
          theme={isError ? "destructive" : "primary"}
          trend={{ value: 12.4, direction: "up" }}
          sparklineData={[10, 20, 15, 25, 30]}
        />

        <ProgressStatCard
          title="Pacing Goal State"
          value={isLoading ? 0 : 64}
          targetValue={100}
          suffix="%"
          progress={isLoading ? 0 : 64}
          isLoading={isLoading}
          theme="chart-3"
          pacingLabel="Review in 3 days"
        />

        <MultiMetricStatCard
          title="MultiMetric State"
          primaryValue={isLoading ? 0 : "Cluster A"}
          isLoading={isLoading}
          metrics={[
            { label: "Pods", value: isLoading ? "-" : "28/30" },
            { label: "Restarts", value: isLoading ? "-" : "0" },
            { label: "Status", value: isLoading ? "-" : "Ready" },
          ]}
        />

        <LiveStatCard
          title="Live Stream Pulsing"
          value={isLoading ? 0 : liveTicker.value}
          isLoading={isLoading}
          suffix=" req/s"
          status={isError ? "error" : "online"}
          statusText={isError ? "Degraded" : "Nominal"}
        />
      </div>
    </div>
  );
}
