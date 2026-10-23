import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { InfolistShowcasePage } from "@/features/showcase/pages/InfolistShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("infolists_title"),
    description: t("infolists_description"),
  };
}

export default function Page() {
  return <InfolistShowcasePage />;
}
