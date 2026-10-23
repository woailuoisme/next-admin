import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("forgot_title"), description: t("forgot_description") };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return <ForgotPasswordPage expired={expired === "1"} />;
}
