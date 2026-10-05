import type { Metadata } from "next";
import { LoginPage } from "@/features/auth/pages/LoginPage";

export const metadata: Metadata = {
  title: "用户登录",
  description: "登录到 Next SN Admin 企业管理后台",
};

export default function Page() {
  return <LoginPage />;
}
