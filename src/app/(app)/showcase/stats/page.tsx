import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StatsShowcasePage } from "@/features/showcase/pages/StatsShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("stats_title"),
    description: t("stats_description"),
  };
}

export default function Page() {
  return <StatsShowcasePage />;
}
