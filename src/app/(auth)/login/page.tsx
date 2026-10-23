import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginPage } from "@/features/auth/pages/LoginPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("page_title"), description: t("page_description") };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <LoginPage initialEmail={email} />;
}
