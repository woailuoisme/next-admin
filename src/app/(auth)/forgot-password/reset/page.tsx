import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("reset_title"), description: t("reset_description") };
}

export default function Page() {
  return <ResetPasswordPage />;
}
