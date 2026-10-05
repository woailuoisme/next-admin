import type { Metadata } from "next";
import { MapShowcasePage } from "@/features/showcase/pages/MapShowcasePage";

export const metadata: Metadata = {
  title: "地图组件",
  description: "交互式地理信息、网格与标记地图组件演示",
};

export default function Page() {
  return <MapShowcasePage />;
}
