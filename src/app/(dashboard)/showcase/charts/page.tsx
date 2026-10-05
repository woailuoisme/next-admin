import type { Metadata } from "next";
import { ChartsShowcasePage } from "@/features/showcase/pages/ChartsShowcasePage";

export const metadata: Metadata = {
  title: "图表展示",
  description: "企业级多维可视化图表与数据趋势分析组件",
};

export default function Page() {
  return <ChartsShowcasePage />;
}
