"use client";

import { useMemoizedFn } from "ahooks";
import { delay } from "es-toolkit";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Compass,
  Gauge,
  Layers,
  PieChart as PieChartIcon,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import {
  AreaTrendChart,
  BarTrendChart,
  CHART_PALETTE,
  ChartCard,
  ComposedTrendChart,
  DonutDistributionChart,
  FunnelConversionChart,
  HeatmapMatrixChart,
  HorizontalBarChart,
  LineTrendChart,
  MetricSparkline,
  RadarMetricChart,
  RadialGaugeChart,
  ScatterMetricChart,
  TreemapDistributionChart,
  WaterfallFinancialChart,
} from "@/components/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeRange = "7d" | "30d" | "90d" | "12m";
type DemoState = "normal" | "loading" | "empty" | "error";

const DEMO_STATES: readonly DemoState[] = ["normal", "loading", "empty", "error"] as const;

/** 演示状态 → 切换按钮文案 */
const DEMO_STATE_LABELS: Record<DemoState, string> = {
  normal: "正常",
  loading: "加载中",
  empty: "空数据",
  error: "异常",
};

/**
 * 页面特性高亮卡片
 * 图标配色属页面 chrome 的公认功能色，统一收敛于此表
 */
const FEATURE_HIGHLIGHTS = [
  {
    icon: Layers,
    iconClass: "bg-blue-500/10 text-blue-500",
    title: "单一职责架构",
    description: "每个图表独立子目录、类型与 Hook 分离",
  },
  {
    icon: Sparkles,
    iconClass: "bg-emerald-500/10 text-emerald-500",
    title: "Vercel 性能最佳实践",
    description: "常量提升、Tooltip Memo、MemoizedFn 优化",
  },
  {
    icon: Compass,
    iconClass: "bg-violet-500/10 text-violet-500",
    title: "现代化工具链驱动",
    description: "集成 es-toolkit 运算与 ahooks 响应式监听",
  },
  {
    icon: CheckCircle2,
    iconClass: "bg-amber-500/10 text-amber-500",
    title: "向下 100% 兼容",
    description: "@/components/stats 无损桥接重导出",
  },
] as const;

interface TrendDataPoint {
  period: string;
  revenue: number;
  profit: number;
  cost: number;
  orders: number;
  refunds: number;
  conversionRate: number;
  [key: string]: unknown;
}

const TIME_RANGE_DATA: Record<TimeRange, TrendDataPoint[]> = {
  "7d": [
    {
      period: "周一",
      revenue: 12400,
      profit: 5200,
      cost: 7200,
      orders: 310,
      refunds: 12,
      conversionRate: 3.2,
    },
    {
      period: "周二",
      revenue: 14800,
      profit: 6300,
      cost: 8500,
      orders: 375,
      refunds: 14,
      conversionRate: 3.6,
    },
    {
      period: "周三",
      revenue: 13900,
      profit: 5900,
      cost: 8000,
      orders: 340,
      refunds: 9,
      conversionRate: 3.4,
    },
    {
      period: "周四",
      revenue: 18200,
      profit: 8100,
      cost: 10100,
      orders: 460,
      refunds: 18,
      conversionRate: 4.1,
    },
    {
      period: "周五",
      revenue: 22400,
      profit: 10200,
      cost: 12200,
      orders: 580,
      refunds: 22,
      conversionRate: 4.8,
    },
    {
      period: "周六",
      revenue: 26800,
      profit: 12600,
      cost: 14200,
      orders: 690,
      refunds: 25,
      conversionRate: 5.2,
    },
    {
      period: "周日",
      revenue: 24500,
      profit: 11400,
      cost: 13100,
      orders: 620,
      refunds: 19,
      conversionRate: 4.9,
    },
  ],
  "30d": [
    {
      period: "第1周",
      revenue: 84000,
      profit: 36000,
      cost: 48000,
      orders: 2100,
      refunds: 75,
      conversionRate: 3.5,
    },
    {
      period: "第2周",
      revenue: 96000,
      profit: 42000,
      cost: 54000,
      orders: 2450,
      refunds: 88,
      conversionRate: 3.8,
    },
    {
      period: "第3周",
      revenue: 112000,
      profit: 51000,
      cost: 61000,
      orders: 2890,
      refunds: 92,
      conversionRate: 4.2,
    },
    {
      period: "第4周",
      revenue: 128000,
      profit: 59000,
      cost: 69000,
      orders: 3200,
      refunds: 104,
      conversionRate: 4.6,
    },
  ],
  "90d": [
    {
      period: "1月",
      revenue: 380000,
      profit: 165000,
      cost: 215000,
      orders: 9800,
      refunds: 320,
      conversionRate: 3.7,
    },
    {
      period: "2月",
      revenue: 420000,
      profit: 188000,
      cost: 232000,
      orders: 10800,
      refunds: 350,
      conversionRate: 4.0,
    },
    {
      period: "3月",
      revenue: 510000,
      profit: 235000,
      cost: 275000,
      orders: 13200,
      refunds: 410,
      conversionRate: 4.5,
    },
  ],
  "12m": [
    {
      period: "Q1",
      revenue: 1310000,
      profit: 588000,
      cost: 722000,
      orders: 33800,
      refunds: 1080,
      conversionRate: 3.9,
    },
    {
      period: "Q2",
      revenue: 1560000,
      profit: 715000,
      cost: 845000,
      orders: 40200,
      refunds: 1250,
      conversionRate: 4.2,
    },
    {
      period: "Q3",
      revenue: 1780000,
      profit: 828000,
      cost: 952000,
      orders: 46100,
      refunds: 1420,
      conversionRate: 4.5,
    },
    {
      period: "Q4",
      revenue: 2150000,
      profit: 1012000,
      cost: 1138000,
      orders: 56400,
      refunds: 1690,
      conversionRate: 4.9,
    },
  ],
};

const CATEGORY_DISTRIBUTION = [
  { name: "电子数码", value: 34500, color: CHART_PALETTE[0] },
  { name: "服装配饰", value: 24800, color: CHART_PALETTE[1] },
  { name: "家居生活", value: 18200, color: CHART_PALETTE[2] },
  { name: "美妆个护", value: 14600, color: CHART_PALETTE[3] },
  { name: "运动户外", value: 9800, color: CHART_PALETTE[4] },
  { name: "生鲜食品", value: 7200, color: CHART_PALETTE[5] },
];

const TRAFFIC_CHANNELS = [
  { label: "自然搜索 (Organic Search)", value: 48200 },
  { label: "直接访问 (Direct Entry)", value: 32600 },
  { label: "社媒营销 (Social Media)", value: 24100 },
  { label: "付费广告 (PPC / SEM)", value: 19800 },
  { label: "邮件推送 (Newsletter EDM)", value: 11500 },
  { label: "合作分销 (Affiliate)", value: 7400 },
];

const ARCHITECTURE_RADAR_DATA = [
  { subject: "高可用性", score: 94, benchmark: 85 },
  { subject: "响应性能", score: 91, benchmark: 80 },
  { subject: "安全合规", score: 98, benchmark: 90 },
  { subject: "测试覆盖率", score: 88, benchmark: 75 },
  { subject: "代码规范度", score: 95, benchmark: 82 },
  { subject: "可观测性", score: 92, benchmark: 78 },
];

const PERIOD_OPTIONS = [
  { label: "7天", value: "7d" },
  { label: "30天", value: "30d" },
  { label: "90天", value: "90d" },
  { label: "年度", value: "12m" },
];

const CURRENCY_FORMATTER = (val: number) => `¥${val.toLocaleString("zh-CN")}`;

// ---------------------------------------------------------------------------
// 行业级商业分析图表数据 (Enterprise Business Analytics Datasets)
// ---------------------------------------------------------------------------

const ENTERPRISE_FUNNEL_DATA = [
  { name: "官网访问 (Visits)", value: 85000, fill: "var(--chart-1)" },
  { name: "注册线索 (Leads)", value: 42000, fill: "var(--chart-2)" },
  { name: "产品试用 (Trials)", value: 21500, fill: "var(--chart-3)" },
  { name: "商机洽谈 (Pipeline)", value: 9800, fill: "var(--chart-4)" },
  { name: "签约成单 (Closed Won)", value: 3450, fill: "var(--chart-5)" },
];

const ENTERPRISE_WATERFALL_DATA = [
  { label: "主营业务总营收", value: 1250000, isTotal: true },
  { label: "直接采购与物料成本", value: -420000 },
  { label: "仓储物流履约开支", value: -130000 },
  { label: "主营业务毛利", value: 700000, isTotal: true },
  { label: "市场推广获客预算", value: -180000 },
  { label: "产品研发与算力集群", value: -160000 },
  { label: "行政合规与团队开销", value: -90000 },
  { label: "利息净收益与政策补贴", value: 45000 },
  { label: "税前净利润", value: 315000, isTotal: true },
];

const ENTERPRISE_SCATTER_DATA = [
  { name: "战略大客户 A", x: 12000, y: 88000, z: 45, segment: "战略高价值" },
  { name: "中型商户 B", x: 4200, y: 34000, z: 18, segment: "稳健核心" },
  { name: "初创团队 C", x: 1600, y: 14500, z: 8, segment: "潜力初创" },
  { name: "异常成本客 D", x: 8900, y: 26000, z: 12, segment: "获客成本警戒" },
  { name: "战略大客户 E", x: 16500, y: 118000, z: 62, segment: "战略高价值" },
  { name: "中型商户 F", x: 3100, y: 29500, z: 15, segment: "稳健核心" },
  { name: "成长型商户 G", x: 6800, y: 52000, z: 28, segment: "高速成长" },
  { name: "异常成本客 H", x: 9800, y: 31000, z: 14, segment: "获客成本警戒" },
  { name: "初创团队 I", x: 2200, y: 18000, z: 10, segment: "潜力初创" },
  { name: "成长型商户 J", x: 7400, y: 61000, z: 32, segment: "高速成长" },
];

const ENTERPRISE_TREEMAP_DATA = [
  {
    name: "云原生算力与基础设施",
    children: [
      { name: "Kubernetes 容器引擎", size: 480000 },
      { name: "对象存储 OSS / S3", size: 290000 },
      { name: "全球边缘 CDN 节点", size: 170000 },
      { name: "弹性负载均衡 ALB", size: 110000 },
    ],
  },
  {
    name: "数据智能与 AI 推理中心",
    children: [
      { name: "GPU 专用大模型推理集群", size: 680000 },
      { name: "向量数据库与检索微服务", size: 320000 },
      { name: "实时数仓与流批一体引擎", size: 250000 },
    ],
  },
  {
    name: "企业级协作套件与开发者工具",
    children: [
      { name: "全链路 APM 与监控观测", size: 220000 },
      { name: "安全扫描与研发门禁", size: 150000 },
      { name: "自动化 CI/CD 虚拟工作流", size: 190000 },
    ],
  },
];

const ENTERPRISE_HEATMAP_DATA = [
  { day: "周一", hour: "00:00", value: 12 },
  { day: "周一", hour: "03:00", value: 5 },
  { day: "周一", hour: "06:00", value: 18 },
  { day: "周一", hour: "09:00", value: 85 },
  { day: "周一", hour: "12:00", value: 68 },
  { day: "周一", hour: "15:00", value: 92 },
  { day: "周一", hour: "18:00", value: 74 },
  { day: "周一", hour: "21:00", value: 45 },

  { day: "周二", hour: "00:00", value: 15 },
  { day: "周二", hour: "03:00", value: 6 },
  { day: "周二", hour: "06:00", value: 22 },
  { day: "周二", hour: "09:00", value: 94 },
  { day: "周二", hour: "12:00", value: 78 },
  { day: "周二", hour: "15:00", value: 105 },
  { day: "周二", hour: "18:00", value: 82 },
  { day: "周二", hour: "21:00", value: 50 },

  { day: "周三", hour: "00:00", value: 14 },
  { day: "周三", hour: "03:00", value: 4 },
  { day: "周三", hour: "06:00", value: 20 },
  { day: "周三", hour: "09:00", value: 98 },
  { day: "周三", hour: "12:00", value: 80 },
  { day: "周三", hour: "15:00", value: 112 },
  { day: "周三", hour: "18:00", value: 86 },
  { day: "周三", hour: "21:00", value: 54 },

  { day: "周四", hour: "00:00", value: 18 },
  { day: "周四", hour: "03:00", value: 8 },
  { day: "周四", hour: "06:00", value: 24 },
  { day: "周四", hour: "09:00", value: 102 },
  { day: "周四", hour: "12:00", value: 85 },
  { day: "周四", hour: "15:00", value: 120 },
  { day: "周四", hour: "18:00", value: 90 },
  { day: "周四", hour: "21:00", value: 60 },

  { day: "周五", hour: "00:00", value: 20 },
  { day: "周五", hour: "03:00", value: 10 },
  { day: "周五", hour: "06:00", value: 26 },
  { day: "周五", hour: "09:00", value: 110 },
  { day: "周五", hour: "12:00", value: 95 },
  { day: "周五", hour: "15:00", value: 128 },
  { day: "周五", hour: "18:00", value: 98 },
  { day: "周五", hour: "21:00", value: 72 },

  { day: "周六", hour: "00:00", value: 35 },
  { day: "周六", hour: "03:00", value: 14 },
  { day: "周六", hour: "06:00", value: 16 },
  { day: "周六", hour: "09:00", value: 58 },
  { day: "周六", hour: "12:00", value: 75 },
  { day: "周六", hour: "15:00", value: 88 },
  { day: "周六", hour: "18:00", value: 96 },
  { day: "周六", hour: "21:00", value: 85 },

  { day: "周日", hour: "00:00", value: 30 },
  { day: "周日", hour: "03:00", value: 12 },
  { day: "周日", hour: "06:00", value: 15 },
  { day: "周日", hour: "09:00", value: 52 },
  { day: "周日", hour: "12:00", value: 68 },
  { day: "周日", hour: "15:00", value: 82 },
  { day: "周日", hour: "18:00", value: 88 },
  { day: "周日", hour: "21:00", value: 70 },
];

const BRUSH_TIMELINE_DATA = [
  { period: "1月", revenue: 42000, cost: 24000 },
  { period: "2月", revenue: 48000, cost: 28000 },
  { period: "3月", revenue: 53000, cost: 31000 },
  { period: "4月", revenue: 61000, cost: 34000 },
  { period: "5月", revenue: 59000, cost: 33000 },
  { period: "6月", revenue: 72000, cost: 41000 },
  { period: "7月", revenue: 84000, cost: 49000 },
  { period: "8月", revenue: 79000, cost: 46000 },
  { period: "9月", revenue: 91000, cost: 52000 },
  { period: "10月", revenue: 98000, cost: 55000 },
  { period: "11月", revenue: 115000, cost: 63000 },
  { period: "12月", revenue: 132000, cost: 71000 },
];

const SPARKLINE_REVENUE = [14, 18, 16, 24, 22, 35, 32, 48, 42, 56, 68];
const SPARKLINE_PIPELINE = [32, 28, 45, 42, 58, 62, 70, 68, 85, 92];
const SPARKLINE_DEFECT = [12, 14, 10, 15, 9, 8, 6, 7, 5, 4, 3];

export function ChartsShowcasePage() {
  const [activePeriod, setActivePeriod] = useState<TimeRange>("7d");
  const [demoState, setDemoState] = useState<DemoState>("normal");

  const trendData = TIME_RANGE_DATA[activePeriod];

  const handlePeriodChange = useMemoizedFn((newPeriod: string) => {
    setActivePeriod(newPeriod as TimeRange);
  });

  const handleRetry = useMemoizedFn(async () => {
    setDemoState("loading");
    await delay(700);
    setDemoState("normal");
  });

  const isStateLoading = demoState === "loading";
  const isStateEmpty = demoState === "empty";
  const stateErrorMessage =
    demoState === "error" ? "图表数据请求异常，无法加载最新聚合指标 (HTTP 502)" : undefined;

  // 演示状态机 → ChartCard 状态 props：22 张图表卡片统一展开，避免逐个重复四行
  const chartStateProps = {
    isLoading: isStateLoading,
    isEmpty: isStateEmpty,
    errorMessage: stateErrorMessage,
    onRetry: handleRetry,
  };

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header Title Section */}
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">图表组件库 / Chart Library</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              src/components/chart
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            对标企业级监控仪表盘的高性能、响应式、模块化设计系统图表套件，内置 8
            大图表类型、响应式容器及完备的状态反馈。
          </p>
        </div>

        {/* State Controls & Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-muted/60 flex items-center gap-1.5 rounded-md border p-1 text-xs">
            <span className="text-muted-foreground px-1.5 font-medium">演示状态:</span>
            {DEMO_STATES.map((state) => (
              <Button
                key={state}
                variant={demoState === state ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setDemoState(state)}
              >
                {DEMO_STATE_LABELS[state]}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            刷新渲染
          </Button>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {FEATURE_HIGHLIGHTS.map(({ icon: Icon, iconClass, title, description }) => (
          <Card key={title} className="border-border/60 bg-muted/30 flex items-center gap-3 p-3.5">
            <div className={`rounded-md p-2 ${iconClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <div className="text-foreground font-semibold">{title}</div>
              <div className="text-muted-foreground">{description}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Showcase Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/70 grid h-auto! w-full grid-cols-2 gap-1 border p-1 sm:grid-cols-3 xl:grid-cols-5">
          <TabsTrigger
            value="all"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            全景图表 (Overview)
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            趋势与混合 (Trend & Composed)
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <PieChartIcon className="h-3.5 w-3.5" />
            分布与排名 (Distribution)
          </TabsTrigger>
          <TabsTrigger
            value="gauges"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <Gauge className="h-3.5 w-3.5" />
            度量与仪表盘 (Gauges & Radar)
          </TabsTrigger>
          <TabsTrigger
            value="enterprise"
            className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
          >
            <Briefcase className="h-3.5 w-3.5" />
            商业分析 (Enterprise)
          </TabsTrigger>
        </TabsList>

        {/* 1. All Overview Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Row 1: Area Trend + Donut Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="经营收支趋势分析 (AreaTrendChart)"
                description="双序列渐变面积图，支持平滑样条曲线、自定义格式化与周期过滤"
                periods={PERIOD_OPTIONS}
                activePeriod={activePeriod}
                onPeriodChange={handlePeriodChange}
                {...chartStateProps}
                height={320}
              >
                <AreaTrendChart
                  data={trendData}
                  dataKey="revenue"
                  secondaryDataKey="cost"
                  xAxisKey="period"
                  height={320}
                  valueFormatter={CURRENCY_FORMATTER}
                  theme="chart-1"
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard
                title="类目销售构成 (DonutDistributionChart)"
                description="带中心聚合指标与圆环图例的高性能切片分布"
                {...chartStateProps}
                height={320}
              >
                <DonutDistributionChart
                  data={CATEGORY_DISTRIBUTION}
                  centerLabel="销售总额"
                  centerValue="¥109.1k"
                  valueFormatter={CURRENCY_FORMATTER}
                  height={320}
                  innerRadius={65}
                  outerRadius={95}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 2: Bar Trend + Horizontal Bar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="订单量与退单分布 (BarTrendChart)"
              description="多维度柱状图，支持圆角顶柱、自适应刻度及对比"
              periods={PERIOD_OPTIONS}
              activePeriod={activePeriod}
              onPeriodChange={handlePeriodChange}
              {...chartStateProps}
              height={300}
            >
              <BarTrendChart
                data={trendData}
                dataKey="orders"
                secondaryDataKey="refunds"
                xAxisKey="period"
                height={300}
                theme="chart-2"
              />
            </ChartCard>

            <ChartCard
              title="全渠道流量来源贡献 (HorizontalBarChart)"
              description="支持内置排序 (es-toolkit.orderBy)、百分比聚合与最大项目截断"
              {...chartStateProps}
              height={300}
            >
              <HorizontalBarChart
                data={TRAFFIC_CHANNELS}
                valueFormatter={(val) => `${val.toLocaleString()} 次`}
                showPercentage={true}
                maxItems={6}
                theme="chart-4"
                height={300}
              />
            </ChartCard>
          </div>

          {/* Row 3: Composed Trend + Gauge & Radar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="营收规模与转化率组合分析 (ComposedTrendChart)"
                description="柱线融合图表：柱状分析绝对规模，折线追踪转化比率，支持多轴对齐"
                periods={PERIOD_OPTIONS}
                activePeriod={activePeriod}
                onPeriodChange={handlePeriodChange}
                {...chartStateProps}
                height={300}
              >
                <ComposedTrendChart
                  data={trendData}
                  xAxisKey="period"
                  height={300}
                  bars={[
                    {
                      dataKey: "revenue",
                      name: "营收",
                      color: CHART_PALETTE[0],
                    },
                  ]}
                  lines={[
                    {
                      dataKey: "profit",
                      name: "净利润",
                      color: CHART_PALETTE[1],
                      strokeWidth: 2.5,
                    },
                  ]}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <ChartCard
                title="核心系统健康度 (RadialGaugeChart)"
                description="径向半圆仪表盘，支持阈值自适应着色与指标标签"
                {...chartStateProps}
                height={140}
              >
                <RadialGaugeChart
                  value={99.85}
                  max={100}
                  label="核心 API 可用率"
                  unit="%"
                  theme="chart-2"
                  height={130}
                />
              </ChartCard>

              <ChartCard
                title="架构审计维度评分 (RadarMetricChart)"
                description="六维雷达网状图，支持基准线对比"
                {...chartStateProps}
                height={160}
              >
                <RadarMetricChart
                  data={ARCHITECTURE_RADAR_DATA}
                  height={160}
                  series={[
                    {
                      dataKey: "score",
                      name: "当前指标",
                      color: CHART_PALETTE[7],
                    },
                    {
                      dataKey: "benchmark",
                      name: "行业基准",
                      color: "#94a3b8",
                    },
                  ]}
                />
              </ChartCard>
            </div>
          </div>
        </TabsContent>

        {/* 2. Trends Focus Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="单折线趋势带参考基线 (LineTrendChart)"
              description="呈现高频波动趋势，包含参考警戒线与平滑贝塞尔曲线"
              periods={PERIOD_OPTIONS}
              activePeriod={activePeriod}
              onPeriodChange={handlePeriodChange}
              {...chartStateProps}
              height={320}
            >
              <LineTrendChart
                data={trendData}
                dataKey="revenue"
                xAxisKey="period"
                height={320}
                valueFormatter={CURRENCY_FORMATTER}
                referenceValue={20000}
                referenceLabel="目标基准线 (¥20,000)"
                theme="secondary"
              />
            </ChartCard>

            <ChartCard
              title="多折线对比趋势 (LineTrendChart)"
              description="多维度指标同步观察，自动计算坐标范围与高亮节点"
              periods={PERIOD_OPTIONS}
              activePeriod={activePeriod}
              onPeriodChange={handlePeriodChange}
              {...chartStateProps}
              height={320}
            >
              <LineTrendChart
                data={trendData}
                xAxisKey="period"
                height={320}
                series={[
                  {
                    dataKey: "orders",
                    name: "下单量",
                    color: CHART_PALETTE[0],
                  },
                  {
                    dataKey: "refunds",
                    name: "退款单量",
                    color: CHART_PALETTE[3],
                  },
                ]}
              />
            </ChartCard>
          </div>

          <ChartCard
            title="单柱对比分析 (BarTrendChart)"
            description="大尺寸柱状对比，清晰展现多时间段数据变动"
            periods={PERIOD_OPTIONS}
            activePeriod={activePeriod}
            onPeriodChange={handlePeriodChange}
            {...chartStateProps}
            height={340}
          >
            <BarTrendChart
              data={trendData}
              dataKey="revenue"
              secondaryDataKey="cost"
              xAxisKey="period"
              height={340}
              valueFormatter={CURRENCY_FORMATTER}
              theme="chart-5"
            />
          </ChartCard>
        </TabsContent>

        {/* 3. Distribution Focus Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="环形占比分布 (DonutDistributionChart)"
              description="支持自定义内外半径、居中合计文本、单切片悬浮动画"
              {...chartStateProps}
              height={320}
            >
              <DonutDistributionChart
                data={CATEGORY_DISTRIBUTION}
                centerLabel="总品类数"
                centerValue="6 大类别"
                valueFormatter={CURRENCY_FORMATTER}
                height={320}
              />
            </ChartCard>

            <ChartCard
              title="长尾分布横向排名 (HorizontalBarChart)"
              description="横向条形图，极佳适配长文本标签，支持内置百分比展示"
              {...chartStateProps}
              height={320}
            >
              <HorizontalBarChart
                data={TRAFFIC_CHANNELS}
                valueFormatter={(v) => `${v.toLocaleString()} UV`}
                showPercentage={true}
                theme="chart-2"
                height={320}
              />
            </ChartCard>
          </div>
        </TabsContent>

        {/* 4. Gauges & Radar Tab */}
        <TabsContent value="gauges" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ChartCard
              title="SLA 达成率 (Emerald 仪表盘)"
              description="安全健康指标推荐配色"
              {...chartStateProps}
              height={200}
            >
              <RadialGaugeChart
                value={99.9}
                max={100}
                label="正常运行时间"
                unit="%"
                theme="chart-2"
                height={180}
              />
            </ChartCard>

            <ChartCard
              title="系统负载率 (Amber 仪表盘)"
              description="资源负载与预警建议配色"
              {...chartStateProps}
              height={200}
            >
              <RadialGaugeChart
                value={78.4}
                max={100}
                label="集群内存消耗"
                unit="%"
                theme="chart-3"
                height={180}
              />
            </ChartCard>

            <ChartCard
              title="客户满意度 (Purple 仪表盘)"
              description="自定义 formattedValue 重写"
              {...chartStateProps}
              height={200}
            >
              <RadialGaugeChart
                value={92}
                max={100}
                formattedValue="4.6 / 5.0"
                label="CSAT 评分"
                theme="chart-4"
                height={180}
              />
            </ChartCard>
          </div>

          <ChartCard
            title="多维系统架构审计雷达图 (RadarMetricChart)"
            description="评估架构健全度，支持填充多边形半透明重叠展示与自适应网格"
            {...chartStateProps}
            height={340}
          >
            <RadarMetricChart
              data={ARCHITECTURE_RADAR_DATA}
              height={340}
              series={[
                {
                  dataKey: "score",
                  name: "当前审计得分",
                  color: CHART_PALETTE[0],
                },
                {
                  dataKey: "benchmark",
                  name: "业界标杆水准",
                  color: CHART_PALETTE[3],
                },
              ]}
            />
          </ChartCard>
        </TabsContent>

        {/* 5. Enterprise Commercial Analytics Tab */}
        <TabsContent value="enterprise" className="space-y-6">
          {/* Metric Sparkline KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">主营实时营收</span>
                <div className="text-2xl font-bold tracking-tight">¥1,250,000</div>
                <div className="text-primary flex items-center gap-1 text-xs font-medium">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>+18.4% 环比增长</span>
                </div>
              </div>
              <div className="h-12 w-28">
                <MetricSparkline
                  data={SPARKLINE_REVENUE}
                  color="var(--primary)"
                  height={48}
                  width={112}
                  fill={true}
                  showEndpointDot={true}
                />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">活跃商机规模</span>
                <div className="text-2xl font-bold tracking-tight">3,450 席</div>
                <div className="text-primary flex items-center gap-1 text-xs font-medium">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>+24.6% 环比上扬</span>
                </div>
              </div>
              <div className="h-12 w-28">
                <MetricSparkline
                  data={SPARKLINE_PIPELINE}
                  color="var(--chart-2)"
                  height={48}
                  width={112}
                  fill={true}
                  showEndpointDot={true}
                />
              </div>
            </Card>

            <Card className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">异常告警频次</span>
                <div className="text-2xl font-bold tracking-tight">3 次/日</div>
                <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <ArrowDownRight className="text-destructive h-3.5 w-3.5" />
                  <span className="text-destructive">-45.2% 持续收敛</span>
                </div>
              </div>
              <div className="h-12 w-28">
                <MetricSparkline
                  data={SPARKLINE_DEFECT}
                  color="var(--destructive)"
                  height={48}
                  width={112}
                  fill={true}
                  showEndpointDot={true}
                />
              </div>
            </Card>
          </div>

          {/* Funnel + Waterfall */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="商机全链路转化漏斗 (FunnelConversionChart)"
              description="自动计算阶段转化率、留存率与流失率，直观呈现销售管道流转效率"
              showFullscreen={true}
              {...chartStateProps}
              height={340}
            >
              <FunnelConversionChart
                data={ENTERPRISE_FUNNEL_DATA}
                valueFormatter={(val) => `${val.toLocaleString()} 人`}
                height={320}
              />
            </ChartCard>

            <ChartCard
              title="企业财务损益结构瀑布图 (WaterfallFinancialChart)"
              description="解析主营收入、采购成本、研发与营销扣减，区分正负增量与汇总柱"
              showFullscreen={true}
              {...chartStateProps}
              height={340}
            >
              <WaterfallFinancialChart
                data={ENTERPRISE_WATERFALL_DATA}
                valueFormatter={CURRENCY_FORMATTER}
                height={320}
              />
            </ChartCard>
          </div>

          {/* Scatter + Treemap */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="客户价值矩阵 (ScatterMetricChart)"
              description="获客成本 vs 客户生命周期价值，气泡大小映射订单量，内置四象限基准线"
              showFullscreen={true}
              {...chartStateProps}
              height={340}
            >
              <ScatterMetricChart
                data={ENTERPRISE_SCATTER_DATA}
                xAxisKey="x"
                yAxisKey="y"
                zAxisKey="z"
                nameKey="name"
                xAxisLabel="获客成本 (CAC)"
                yAxisLabel="生命周期价值 (LTV)"
                zAxisLabel="订单频次"
                xReferenceLine={7000}
                yReferenceLine={45000}
                xValueFormatter={CURRENCY_FORMATTER}
                yValueFormatter={CURRENCY_FORMATTER}
                height={320}
              />
            </ChartCard>

            <ChartCard
              title="产品矩阵营收层级树图 (TreemapDistributionChart)"
              description="多层级板块面积权重分布，支持悬浮占比卡片与自适应布局"
              showFullscreen={true}
              {...chartStateProps}
              height={340}
            >
              <TreemapDistributionChart
                data={ENTERPRISE_TREEMAP_DATA}
                valueFormatter={CURRENCY_FORMATTER}
                height={320}
              />
            </ChartCard>
          </div>

          {/* Heatmap + Brush Area Trend */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="7×24 周活跃热力矩阵 (HeatmapMatrixChart)"
              description="纯矢量 SVG 栅格矩阵，清晰识别访问高峰与调度维护窗口"
              showFullscreen={true}
              {...chartStateProps}
              height={340}
            >
              <HeatmapMatrixChart
                data={ENTERPRISE_HEATMAP_DATA}
                xKey="hour"
                yKey="day"
                valueKey="value"
                xLabel="时段"
                yLabel="星期"
                valueFormatter={(val) => `${val} QPS 负载`}
                height={320}
              />
            </ChartCard>

            <ChartCard
              title="时序缩放与基准参考线 (AreaTrendChart + Brush & ReferenceLines)"
              description="内置 Recharts 微缩滑块 (Brush) 与多目标预警参考线，满足自由时序缩放"
              showFullscreen={true}
              {...chartStateProps}
              height={340}
            >
              <AreaTrendChart
                data={BRUSH_TIMELINE_DATA}
                dataKey="revenue"
                secondaryDataKey="cost"
                xAxisKey="period"
                height={320}
                valueFormatter={CURRENCY_FORMATTER}
                theme="chart-1"
                showBrush={true}
                referenceLines={[
                  {
                    y: 100000,
                    label: "目标冲刺线",
                    stroke: "var(--destructive)",
                    strokeDasharray: "4 4",
                  },
                  {
                    y: 60000,
                    label: "保底基准线",
                    stroke: "var(--chart-2)",
                    strokeDasharray: "3 3",
                  },
                ]}
              />
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ChartsShowcasePage;
