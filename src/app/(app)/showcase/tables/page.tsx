import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TableShowcasePage } from "@/features/showcase/pages/TableShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("tables_title"),
    description: t("tables_description"),
  };
}

export default function Page() {
  return <TableShowcasePage />;
}
