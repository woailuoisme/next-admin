import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  title: {
    template: "%s | Next SN Admin",
    default: "控制台",
  },
  description: "企业级高效中后台管理系统，基于 Next.js 16 App Router 与 Tailwind CSS 构建",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
