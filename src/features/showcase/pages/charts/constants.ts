import { CheckCircle2, Compass, Layers, Sparkles } from "lucide-react";
import { CHART_PALETTE } from "@/components/chart";
import type { DemoState, TimeRange, TrendDataPoint } from "./types";

export const DEMO_STATES: readonly DemoState[] = ["normal", "loading", "empty", "error"] as const;

/** 演示状态 → 切换按钮文案 */
export const DEMO_STATE_LABELS: Record<DemoState, string> = {
  normal: "正常",
  loading: "加载中",
  empty: "空数据",
  error: "异常",
};

/**
 * 页面特性高亮卡片
 * 图标配色属页面 chrome 的公认功能色，统一收敛于此表
 */
export const FEATURE_HIGHLIGHTS = [
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

export const TIME_RANGE_DATA: Record<TimeRange, TrendDataPoint[]> = {
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

export const CATEGORY_DISTRIBUTION = [
  { name: "电子数码", value: 34500, color: CHART_PALETTE[0] },
  { name: "服装配饰", value: 24800, color: CHART_PALETTE[1] },
  { name: "家居生活", value: 18200, color: CHART_PALETTE[2] },
  { name: "美妆个护", value: 14600, color: CHART_PALETTE[3] },
  { name: "运动户外", value: 9800, color: CHART_PALETTE[4] },
  { name: "生鲜食品", value: 7200, color: CHART_PALETTE[5] },
];

export const TRAFFIC_CHANNELS = [
  { label: "自然搜索 (Organic Search)", value: 48200 },
  { label: "直接访问 (Direct Entry)", value: 32600 },
  { label: "社媒营销 (Social Media)", value: 24100 },
  { label: "付费广告 (PPC / SEM)", value: 19800 },
  { label: "邮件推送 (Newsletter EDM)", value: 11500 },
  { label: "合作分销 (Affiliate)", value: 7400 },
];

export const ARCHITECTURE_RADAR_DATA = [
  { subject: "高可用性", score: 94, benchmark: 85 },
  { subject: "响应性能", score: 91, benchmark: 80 },
  { subject: "安全合规", score: 98, benchmark: 90 },
  { subject: "测试覆盖率", score: 88, benchmark: 75 },
  { subject: "代码规范度", score: 95, benchmark: 82 },
  { subject: "可观测性", score: 92, benchmark: 78 },
];

export const PERIOD_OPTIONS = [
  { label: "7天", value: "7d" },
  { label: "30天", value: "30d" },
  { label: "90天", value: "90d" },
  { label: "年度", value: "12m" },
];

export const CURRENCY_FORMATTER = (val: number) => `¥${val.toLocaleString("zh-CN")}`;

// ---------------------------------------------------------------------------
// 行业级商业分析图表数据 (Enterprise Business Analytics Datasets)
// ---------------------------------------------------------------------------

export const ENTERPRISE_FUNNEL_DATA = [
  { name: "官网访问 (Visits)", value: 85000, fill: "var(--chart-1)" },
  { name: "注册线索 (Leads)", value: 42000, fill: "var(--chart-2)" },
  { name: "产品试用 (Trials)", value: 21500, fill: "var(--chart-3)" },
  { name: "商机洽谈 (Pipeline)", value: 9800, fill: "var(--chart-4)" },
  { name: "签约成单 (Closed Won)", value: 3450, fill: "var(--chart-5)" },
];

export const ENTERPRISE_WATERFALL_DATA = [
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

export const ENTERPRISE_SCATTER_DATA = [
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

export const ENTERPRISE_TREEMAP_DATA = [
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

export const ENTERPRISE_HEATMAP_DATA = [
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

export const BRUSH_TIMELINE_DATA = [
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

export const SPARKLINE_REVENUE = [14, 18, 16, 24, 22, 35, 32, 48, 42, 56, 68];
export const SPARKLINE_PIPELINE = [32, 28, 45, 42, 58, 62, 70, 68, 85, 92];
export const SPARKLINE_DEFECT = [12, 14, 10, 15, 9, 8, 6, 7, 5, 4, 3];
