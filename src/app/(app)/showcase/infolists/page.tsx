import type { Metadata } from "next";
import { InfolistShowcasePage } from "@/features/showcase/pages/InfolistShowcasePage";

export const metadata: Metadata = {
  title: "信息列表组件",
  description: "结构化信息与详情数据展示组件演示与开发规范",
};

export default function Page() {
  return <InfolistShowcasePage />;
}
