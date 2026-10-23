import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { VerifyOtpPage } from "@/features/auth/pages/VerifyOtpPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("verify_title"), description: t("verify_description") };
}

export default function Page() {
  return <VerifyOtpPage />;
}
