import type { Metadata } from "next";
import { TableShowcasePage } from "@/features/showcase/pages/TableShowcasePage";

export const metadata: Metadata = {
  title: "数据表格",
  description: "高级数据表格、虚拟化、过滤与自定义列操作演示",
};

export default function Page() {
  return <TableShowcasePage />;
}
