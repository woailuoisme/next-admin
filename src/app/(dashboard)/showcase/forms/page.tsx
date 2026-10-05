import type { Metadata } from "next";
import { FormShowcasePage } from "@/features/showcase/pages/FormShowcasePage";

export const metadata: Metadata = {
  title: "表单展示",
  description: "动态响应、复杂校验与富文本上传等高级表单交互",
};

export default function Page() {
  return <FormShowcasePage />;
}
