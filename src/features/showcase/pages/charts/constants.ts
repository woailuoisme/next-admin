import { CheckCircle2, Compass, Layers, Sparkles } from "lucide-react";

import { CHART_PALETTE } from "@/components/chart/shared/theme";

import type { DemoState } from "./types";

export * from "./enterpriseData";

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
 */
export const FEATURE_HIGHLIGHTS = [
  {
    icon: Layers,
    iconClass: "bg-primary/10 text-primary",
    title: "单一职责架构",
    description: "每个图表独立子目录、类型与 Hook 分离",
  },
  {
    icon: Sparkles,
    iconClass: "bg-chart-2/10 text-chart-2",
    title: "Vercel 性能最佳实践",
    description: "常量提升、Tooltip Memo、MemoizedFn 优化",
  },
  {
    icon: Compass,
    iconClass: "bg-chart-3/10 text-chart-3",
    title: "现代化工具链驱动",
    description: "集成 es-toolkit 运算与 ahooks 响应式监听",
  },
  {
    icon: CheckCircle2,
    iconClass: "bg-chart-4/10 text-chart-4",
    title: "按需拆包零泄漏",
    description: "纯静态主题接缝与按需懒加载隔离 Recharts 运行时",
  },
] as const;

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

export const SPARKLINE_REVENUE = [14, 18, 16, 24, 22, 35, 32, 48, 42, 56, 68];
export const SPARKLINE_PIPELINE = [32, 28, 45, 42, 58, 62, 70, 68, 85, 92];
export const SPARKLINE_DEFECT = [12, 14, 10, 15, 9, 8, 6, 7, 5, 4, 3];
