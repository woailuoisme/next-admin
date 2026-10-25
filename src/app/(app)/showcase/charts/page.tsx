import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { ChartsShowcasePage } from "@/features/showcase/pages/ChartsShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("charts_title"),
    description: t("charts_description"),
  };
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ChartsShowcasePage />
    </Suspense>
  );
}
