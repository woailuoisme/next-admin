import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RealtimeShowcasePage } from "@/features/showcase/pages/RealtimeShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("realtime_title"),
    description: t("realtime_description"),
  };
}

export default function Page() {
  return <RealtimeShowcasePage />;
}
