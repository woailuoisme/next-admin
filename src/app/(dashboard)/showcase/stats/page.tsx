import type { Metadata } from "next";
import { StatsShowcasePage } from "@/features/showcase/pages/StatsShowcasePage";

export const metadata: Metadata = {
  title: "统计卡片",
  description: "核心业务指标卡片、趋势图表与对比数据组件演示",
};

export default function Page() {
  return <StatsShowcasePage />;
}
