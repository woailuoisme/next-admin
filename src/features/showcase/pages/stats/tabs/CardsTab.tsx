import { useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  HardDrive,
  Server,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

import {
  LiveStatCard,
  MultiMetricStatCard,
  ProgressStatCard,
  Sparkline,
  type SparklineLayout,
  StatCard,
  type StatDensity,
  StatsGrid,
  type useLiveTicker,
} from "@/components/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SPARKLINE_AREA_ITEMS, SPARKLINE_BAR_ITEMS } from "../constants";

export interface CardsTabProps {
  liveTicker: ReturnType<typeof useLiveTicker>;
}

type SparklineItem = (typeof SPARKLINE_AREA_ITEMS)[number];

/** 单个色板矩阵（Area / Bar 两份布局仅差标题与图形类型） */
function SparklineMatrix({
  title,
  label,
  type,
  items,
}: {
  title: string;
  label: string;
  type: "area" | "bar";
  items: readonly SparklineItem[];
}) {
  return (
    <div>
      <span className="text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase">{title}</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.theme}
            className="border-border/50 bg-card/60 flex flex-col justify-between space-y-2 rounded-xl border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-medium">{item.name}</span>
              <span className="text-muted-foreground font-mono text-[10px]">{label}</span>
            </div>
            <div className="h-10 w-full">
              <Sparkline data={item.data} theme={item.theme} type={type} className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsTab({ liveTicker }: CardsTabProps) {
  const [cardDensity, setCardDensity] = useState<StatDensity>("compact");
  const [cardSparklineLayout, setCardSparklineLayout] = useState<SparklineLayout>("inline");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">1. Standard StatCards with Sparklines & Themes</h2>
        <p className="text-muted-foreground text-xs">
          Flexible status indicators, sparkline micro-charts, and customizable trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Primary Revenue"
          value={24890}
          prefix="$"
          icon={DollarSign}
          trend={{ value: 14.2, direction: "up", label: "vs last week" }}
          sparklineData={[10, 15, 12, 18, 22, 19, 24, 28]}
          theme="primary"
        />
        <StatCard
          title="Active Sessions"
          value={1840}
          icon={Users}
          trend={{ value: 3.1, direction: "up", label: "vs yesterday" }}
          sparklineData={[12, 14, 18, 17, 21, 24, 25]}
          theme="chart-2"
        />
        <StatCard
          title="System Memory Load"
          value={88.4}
          suffix="%"
          icon={Cpu}
          trend={{ value: 12.0, direction: "up", label: "threshold 85%" }}
          sparklineData={[60, 65, 70, 72, 80, 84, 88]}
          theme="chart-3"
        />
        <StatCard
          title="Critical Error Rate"
          value={0.04}
          suffix="%"
          icon={AlertCircle}
          trend={{
            value: 0.08,
            direction: "down",
            label: "-0.08% improvement",
          }}
          sparklineData={[1.2, 0.9, 0.7, 0.5, 0.3, 0.1, 0.04]}
          theme="destructive"
        />
      </div>

      <div className="pt-4">
        <h2 className="text-foreground text-lg font-semibold">2. ProgressStatCard (Goal Pacing & Theme Accents)</h2>
        <p className="text-muted-foreground text-xs">
          Clear visual feedback on progress bars with intent coloring and pacing metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressStatCard
          title="Sales Pipeline"
          value={390000}
          targetValue={500000}
          prefix="$"
          progress={78}
          theme="primary"
          icon={ArrowUpRight}
          pacingLabel="Goal: $500k"
          description="14 deals scheduled to close this week"
        />
        <ProgressStatCard
          title="Security Hardening"
          value={94}
          targetValue={100}
          suffix="%"
          progress={94}
          theme="chart-2"
          icon={ShieldCheck}
          pacingLabel="SOC2 Type II"
          description="23/24 audit checks fully satisfied"
        />
        <ProgressStatCard
          title="Storage Pool Capacity"
          value={4.3}
          targetValue={5.0}
          suffix="TB"
          progress={86}
          theme="chart-3"
          icon={HardDrive}
          pacingLabel="4.3TB / 5.0TB"
          description="Consider expanding NVMe volume"
        />
        <ProgressStatCard
          title="API Error Budget Burn"
          value={91}
          targetValue={100}
          suffix="%"
          progress={91}
          theme="destructive"
          icon={AlertCircle}
          pacingLabel="Budget: 99.9%"
          description="Burn rate exceeds standard SLO limit"
        />
      </div>

      <div className="pt-4">
        <h2 className="text-foreground text-lg font-semibold">3. MultiMetric & Live Streaming Stat Cards</h2>
        <p className="text-muted-foreground text-xs">
          Density-optimized cards for compound metrics and real-time pulse animations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MultiMetricStatCard
          title="Hardware Node Utilization"
          primaryValue="98.2%"
          primaryLabel="System Health"
          icon={Server}
          metrics={[
            {
              label: "CPU 16 Cores",
              value: "34%",
              trend: { value: 5.2, direction: "down" },
            },
            {
              label: "RAM 64GB",
              value: "52%",
              trend: { value: 2.1, direction: "up" },
            },
            {
              label: "Disk NVMe",
              value: "68%",
              trend: { value: 0.4, direction: "up" },
            },
          ]}
        />

        <MultiMetricStatCard
          title="Marketing Attribution Funnel"
          primaryValue="4.18%"
          primaryLabel="Avg Conversion"
          suffix=" CVR"
          icon={BarChart3}
          metrics={[
            {
              label: "Ad Impressions",
              value: "480k",
              trend: { value: 18.2, direction: "up" },
            },
            {
              label: "Click-Through",
              value: "3.4%",
              trend: { value: 0.8, direction: "up" },
            },
            {
              label: "Activated",
              value: "1,240",
              trend: { value: 9.6, direction: "up" },
            },
          ]}
        />

        <LiveStatCard
          title="Real-Time Event Stream"
          value={liveTicker.value}
          suffix=" events/sec"
          icon={Activity}
          status={liveTicker.status}
          statusText={liveTicker.isRunning ? "LIVE WEBSOCKET" : "PAUSED"}
          lastUpdated="Just now"
          sparklineData={liveTicker.buffer}
          pulse={liveTicker.isRunning}
          description="Sub-millisecond reactive event pipe buffer with dynamic sparkline"
        />
      </div>

      {/* Section 4: Standalone High-Performance Sparkline Micro-Charts */}
      <div className="pt-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              4. Standalone Micro-Charts (Zero-Dependency SVG Sparklines)
            </h2>
            <p className="text-muted-foreground text-xs">
              Ultra-lightweight Bezier smoothing with coordinate precision rounding and sub-millisecond render budget.
            </p>
          </div>
          <Badge variant="outline" className="w-fit font-mono text-[11px]">
            Sparkline Engine
          </Badge>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Semantic Theme Palettes & Style Matrix</CardTitle>
          <CardDescription className="text-xs">
            Embeddable inside tables, headers, dense KPI grids, or standalone micro-cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SparklineMatrix title="Area Gradient Smoothing" label="Area" type="area" items={SPARKLINE_AREA_ITEMS} />
          <SparklineMatrix title="Categorical Bar Histograms" label="Bar" type="bar" items={SPARKLINE_BAR_ITEMS} />
        </CardContent>
      </Card>

      {/* Section 5: Density & Sparkline Layout Matrix */}
      <div className="pt-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              5. Density Scaling & Anti-Truncation Sparkline Layouts
            </h2>
            <p className="text-muted-foreground text-xs">
              Interactive density control (compact, default, comfortable) and bottom-docked sparkline to guarantee 0
              text overflow in 4-column grids.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Density Switcher */}
            <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
              {(["compact", "default", "comfortable"] as const).map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={cardDensity === d ? "secondary" : "ghost"}
                  className="h-7 text-xs capitalize"
                  onClick={() => setCardDensity(d)}
                >
                  {d}
                </Button>
              ))}
            </div>
            {/* Layout Switcher */}
            <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
              {(["inline", "bottom"] as const).map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant={cardSparklineLayout === l ? "secondary" : "ghost"}
                  className="h-7 text-xs capitalize"
                  onClick={() => setCardSparklineLayout(l)}
                >
                  {l === "bottom" ? "Bottom Sparkline" : "Inline Sparkline"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatsGrid columns={4} density={cardDensity} sparklineLayout={cardSparklineLayout}>
        <StatCard
          title="平台有效订单总量"
          value="128,450"
          icon={ShoppingCart}
          theme="primary"
          trend={{ value: "+14.2%", direction: "up", label: "较上周同期" }}
          sparklineData={[20, 24, 28, 26, 32, 38, 42, 49, 58, 65]}
          description="全渠道支付成功的有效订单汇总"
        />
        <StatCard
          title="待发货与履约中"
          value={342}
          icon={Clock}
          theme="chart-3"
          trend={{
            value: "需加急",
            direction: "neutral",
            label: "待拣货出库",
          }}
          sparklineData={[12, 14, 18, 17, 21, 24, 25]}
          description="已分配到区域云仓的待拣选订单"
        />
        <StatCard
          title="妥投履约达成率"
          value="98.6%"
          icon={CheckCircle2}
          theme="chart-2"
          trend={{
            value: "98.6%",
            direction: "up",
            label: "SLA履约承诺达成率",
          }}
          sparklineData={[92, 94, 95, 96, 97, 98, 99]}
          description="48小时妥投承诺履约率"
        />
        <StatCard
          title="平均客单价 (AOV)"
          value={86.5}
          prefix="$"
          icon={DollarSign}
          theme="chart-4"
          trend={{ value: "+8.4%", direction: "up", label: "较上季度平均" }}
          sparklineData={[68, 72, 70, 78, 82, 85, 86.5]}
          description="活跃客户每单平均结算金额"
        />
      </StatsGrid>
    </div>
  );
}
