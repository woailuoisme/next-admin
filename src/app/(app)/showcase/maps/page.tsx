import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MapShowcasePage } from "@/features/showcase/pages/MapShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("maps_title"),
    description: t("maps_description"),
  };
}

export default function Page() {
  return <MapShowcasePage />;
}
