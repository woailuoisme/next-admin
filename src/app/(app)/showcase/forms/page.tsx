import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { FormShowcasePage } from "@/features/showcase/pages/FormShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("showcase");
  return {
    title: t("forms_title"),
    description: t("forms_description"),
  };
}

export default function Page() {
  return <FormShowcasePage />;
}
